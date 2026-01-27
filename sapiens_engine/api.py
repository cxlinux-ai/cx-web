"""
Flask API server for Sapiens Reasoning Engine
Provides HTTP endpoints for reasoning operations
"""

import logging
import signal
import sys
from typing import Optional, Union, Tuple, Any
from functools import wraps

from flask import Flask, request, jsonify, Response

FlaskResponse = Union[Response, Tuple[Response, int]]

from .engine import SapiensReasoningEngine
from .config import SapiensConfig

logger = logging.getLogger(__name__)

app = Flask(__name__)
engine: Optional[SapiensReasoningEngine] = None


def init_engine(config: Optional[SapiensConfig] = None) -> SapiensReasoningEngine:
    """Initialize the reasoning engine"""
    global engine
    if engine is None:
        engine = SapiensReasoningEngine(config)
    return engine


def require_engine(f):
    """Decorator to ensure engine is initialized"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if engine is None:
            return jsonify({
                "success": False,
                "error": "Engine not initialized. Call /health first."
            }), 503
        return f(*args, **kwargs)
    return decorated


def validate_json(required_fields: list):
    """Decorator to validate JSON request body"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not request.is_json:
                return jsonify({
                    "success": False,
                    "error": "Request must be JSON"
                }), 400
            
            data = request.get_json()
            missing = [field for field in required_fields if field not in data]
            if missing:
                return jsonify({
                    "success": False,
                    "error": f"Missing required fields: {missing}"
                }), 400
            
            return f(*args, **kwargs)
        return decorated
    return decorator


@app.route('/health', methods=['GET'])
def health() -> FlaskResponse:
    """
    Health check endpoint
    Returns engine status and configuration
    """
    global engine
    
    try:
        if engine is None:
            engine = init_engine(SapiensConfig.from_env())
        
        status = engine.get_status()
        return jsonify({
            "status": "healthy" if status["initialized"] else "initializing",
            "engine": status,
            "version": "1.0.0"
        })
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500


@app.route('/reason', methods=['POST'])
@require_engine
@validate_json(['problem'])
def reason() -> FlaskResponse:
    """
    Generic problem-solving endpoint
    
    Request body:
    {
        "problem": "Description of the problem to solve"
    }
    
    Returns reasoning chain and solution
    """
    try:
        data = request.get_json()
        problem = data['problem']
        
        logger.info(f"Reasoning request: {problem[:100]}...")
        result = engine.reason(problem)
        
        return jsonify(result.to_dict())
    except Exception as e:
        logger.error(f"Reasoning error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/plan', methods=['POST'])
@require_engine
@validate_json(['project'])
def plan() -> FlaskResponse:
    """
    Project planning endpoint
    
    Request body:
    {
        "project": "Description of the project to plan"
    }
    
    Returns detailed project plan
    """
    try:
        data = request.get_json()
        project = data['project']
        
        logger.info(f"Planning request: {project[:100]}...")
        result = engine.plan(project)
        
        return jsonify(result.to_dict())
    except Exception as e:
        logger.error(f"Planning error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/debug', methods=['POST'])
@require_engine
@validate_json(['code'])
def debug() -> FlaskResponse:
    """
    Code debugging endpoint
    
    Request body:
    {
        "code": "The code to debug",
        "error": "Optional error description"
    }
    
    Returns debugging analysis and fixes
    """
    try:
        data = request.get_json()
        code = data['code']
        error = data.get('error', '')
        
        logger.info(f"Debug request: code length {len(code)}")
        result = engine.debug(code, error)
        
        return jsonify(result.to_dict())
    except Exception as e:
        logger.error(f"Debug error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/optimize', methods=['POST'])
@require_engine
@validate_json(['workflow'])
def optimize() -> FlaskResponse:
    """
    Workflow optimization endpoint
    
    Request body:
    {
        "workflow": "Description of the workflow to optimize",
        "goals": "Optional specific optimization goals"
    }
    
    Returns optimization recommendations
    """
    try:
        data = request.get_json()
        workflow = data['workflow']
        goals = data.get('goals', '')
        
        logger.info(f"Optimize request: {workflow[:100]}...")
        result = engine.optimize(workflow, goals)
        
        return jsonify(result.to_dict())
    except Exception as e:
        logger.error(f"Optimization error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.errorhandler(404)
def not_found(e) -> FlaskResponse:
    """Handle 404 errors"""
    return jsonify({
        "success": False,
        "error": "Endpoint not found",
        "available_endpoints": [
            "GET /health",
            "POST /reason",
            "POST /plan",
            "POST /debug",
            "POST /optimize"
        ]
    }), 404


@app.errorhandler(500)
def server_error(e) -> FlaskResponse:
    """Handle 500 errors"""
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500


def setup_signal_handlers():
    """Set up graceful shutdown handlers"""
    def signal_handler(signum, frame):
        logger.info(f"Received signal {signum}, shutting down...")
        if engine:
            engine.shutdown()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)


def run_server(config: Optional[SapiensConfig] = None):
    """Run the Flask API server"""
    global engine
    
    if config is None:
        config = SapiensConfig.from_env()
    
    logging.basicConfig(
        level=getattr(logging, config.log_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger.info("Starting Sapiens API server...")
    
    engine = SapiensReasoningEngine(config)
    
    logger.info("Pre-initializing engine (this may take a moment)...")
    if engine.initialize():
        logger.info("Engine initialized successfully")
    else:
        logger.warning("Engine initialization deferred - will initialize on first request")
    
    setup_signal_handlers()
    
    logger.info(f"Server starting on {config.api_host}:{config.api_port}")
    app.run(
        host=config.api_host,
        port=config.api_port,
        debug=config.api_debug,
        threaded=True
    )


if __name__ == '__main__':
    run_server()
