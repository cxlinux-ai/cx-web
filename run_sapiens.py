#!/usr/bin/env python3
"""
Sapiens Reasoning Engine - Entry Point
Starts the Flask API server for the multi-agent reasoning system
"""

import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sapiens_engine.config import SapiensConfig
from sapiens_engine.api import run_server


def main():
    parser = argparse.ArgumentParser(
        description='Sapiens 0.27B Reasoning Engine API Server'
    )
    
    parser.add_argument(
        '--host',
        default='0.0.0.0',
        help='Host to bind the server (default: 0.0.0.0)'
    )
    
    parser.add_argument(
        '--port',
        type=int,
        default=8100,
        help='Port to bind the server (default: 8100)'
    )
    
    parser.add_argument(
        '--model',
        default='agent-reasoning/Sapiens-0.27B-HF',
        help='Model name or path (default: agent-reasoning/Sapiens-0.27B-HF)'
    )
    
    parser.add_argument(
        '--max-iterations',
        type=int,
        default=5,
        help='Maximum reasoning iterations (default: 5)'
    )
    
    parser.add_argument(
        '--confidence-threshold',
        type=float,
        default=0.85,
        help='Confidence threshold for early stopping (default: 0.85)'
    )
    
    parser.add_argument(
        '--cache-dir',
        default=None,
        help='Directory for model cache'
    )
    
    parser.add_argument(
        '--log-level',
        default='INFO',
        choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'],
        help='Logging level (default: INFO)'
    )
    
    parser.add_argument(
        '--debug',
        action='store_true',
        help='Enable Flask debug mode'
    )
    
    args = parser.parse_args()
    
    config = SapiensConfig(
        model_name=args.model,
        max_iterations=args.max_iterations,
        confidence_threshold=args.confidence_threshold,
        cache_dir=args.cache_dir,
        log_level=args.log_level,
        api_host=args.host,
        api_port=args.port,
        api_debug=args.debug,
    )
    
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║           Sapiens 0.27B Reasoning Engine v1.0.0              ║
║          Multi-Agent Supervisor System for Linux             ║
╠══════════════════════════════════════════════════════════════╣
║  Model: {config.model_name:<50} ║
║  Host:  {config.api_host}:{config.api_port:<47} ║
║  Max Iterations: {config.max_iterations:<42} ║
║  Confidence Threshold: {config.confidence_threshold:<36} ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    run_server(config)


if __name__ == '__main__':
    main()
