import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimationFrame } from "framer-motion";
import { Server, Zap, CheckCircle, AlertTriangle, Sparkles } from "lucide-react";

interface ServerNode {
  id: string;
  status: 'healthy' | 'failing' | 'critical' | 'recovering';
  health: number;
  name: string;
}

export default function SovereigntyRecoverySimulation() {
  const [servers, setServers] = useState<ServerNode[]>([
    { id: '1', status: 'healthy', health: 100, name: 'web-prod-01' },
    { id: '2', status: 'healthy', health: 100, name: 'api-prod-02' },
    { id: '3', status: 'healthy', health: 100, name: 'db-cluster-03' },
  ]);

  const [hrmAgentActive, setHrmAgentActive] = useState(false);
  const [recoveryInProgress, setRecoveryInProgress] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  // Timer management to prevent memory leaks
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    frameTime: 16.67,
    isMonitoring: false,
    rollbackFpsAlert: false
  });
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);
  const rollbackFpsCheckRef = useRef(false);

  // Cleanup function for all timers and intervals
  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    intervalsRef.current.forEach(clearInterval);
    timersRef.current.clear();
    intervalsRef.current.clear();
  };

  // Auto-start simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      startFailureSimulation();
    }, 2000);
    timersRef.current.add(timer);

    return () => {
      clearAllTimers();
    };
  }, []);

  // Frame rate monitoring during critical animations
  const monitorFrameRate = useCallback((time: number) => {
    frameCountRef.current++;
    const deltaTime = time - lastTimeRef.current;

    // Calculate FPS every 60 frames (approximately 1 second at 60fps)
    if (frameCountRef.current >= 60) {
      const fps = Math.round(60000 / deltaTime);
      const frameTime = deltaTime / 60;

      fpsHistoryRef.current.push(fps);
      if (fpsHistoryRef.current.length > 10) {
        fpsHistoryRef.current.shift(); // Keep only last 10 measurements
      }

      const avgFps = fpsHistoryRef.current.reduce((sum, f) => sum + f, 0) / fpsHistoryRef.current.length;

      // Check for FPS drop during critical atomic rollback
      const isCriticalPhase = simulationStep === 3 && recoveryInProgress;
      const rollbackFpsAlert = isCriticalPhase && avgFps < 58;

      if (isCriticalPhase && !rollbackFpsCheckRef.current) {
        rollbackFpsCheckRef.current = true;
      }

      setPerformanceMetrics(prev => ({
        ...prev,
        fps: Math.round(avgFps),
        frameTime: Number(frameTime.toFixed(2)),
        rollbackFpsAlert: rollbackFpsAlert
      }));

      frameCountRef.current = 0;
      lastTimeRef.current = time;
    }
  }, []);

  // Enable performance monitoring during critical animations
  useAnimationFrame(performanceMetrics.isMonitoring ? monitorFrameRate : () => {});

  // Start performance monitoring during atomic rollback
  useEffect(() => {
    const shouldMonitor = recoveryInProgress || simulationStep === 3;
    setPerformanceMetrics(prev => ({ ...prev, isMonitoring: shouldMonitor }));
  }, [recoveryInProgress, simulationStep]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const startFailureSimulation = () => {
    setCycleCount(prev => prev + 1);
    setSimulationStep(1);

    // Reset performance monitoring for new cycle
    rollbackFpsCheckRef.current = false;
    setPerformanceMetrics(prev => ({ ...prev, rollbackFpsAlert: false }));

    // Server failure - turn red
    setServers(prev => prev.map(server =>
      server.id === '2'
        ? { ...server, status: 'critical', health: 15 }
        : server
    ));

    // Deploy HRM AI Agent after 1.5 seconds
    const agentTimer = setTimeout(() => {
      setSimulationStep(2);
      setHrmAgentActive(true);

      // Start recovery after agent arrives
      const recoveryTimer = setTimeout(() => {
        triggerAtomicRollback();
      }, 2000);
      timersRef.current.add(recoveryTimer);
    }, 1500);
    timersRef.current.add(agentTimer);
  };

  const triggerAtomicRollback = () => {
    setSimulationStep(3);
    setRecoveryInProgress(true);

    // Animate health restoration
    let currentHealth = 15;
    const healthInterval = setInterval(() => {
      currentHealth += 8;
      if (currentHealth >= 100) {
        currentHealth = 100;
        intervalsRef.current.delete(healthInterval);
        clearInterval(healthInterval);
        setRecoveryInProgress(false);
        setSimulationStep(4);

        // Complete recovery
        setServers(prev => prev.map(server =>
          server.id === '2'
            ? { ...server, status: 'healthy', health: 100 }
            : server
        ));

        // Auto-restart simulation after 3 seconds
        const restartTimer = setTimeout(() => {
          setSimulationStep(0);
          setHrmAgentActive(false);

          const nextCycleTimer = setTimeout(startFailureSimulation, 2000);
          timersRef.current.add(nextCycleTimer);
        }, 3000);
        timersRef.current.add(restartTimer);
      } else {
        setServers(prev => prev.map(server =>
          server.id === '2'
            ? { ...server, status: 'recovering', health: currentHealth }
            : server
        ));
      }
    }, 200);

    intervalsRef.current.add(healthInterval);
  };

  const getServerColor = (server: ServerNode) => {
    switch (server.status) {
      case 'healthy': return '#00ff88';
      case 'failing': return '#f59e0b';
      case 'critical': return '#ef4444';
      case 'recovering': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getServerGlow = (server: ServerNode) => {
    const color = getServerColor(server);
    return `0 0 20px ${color}40, 0 0 40px ${color}20`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-950/90 backdrop-blur-xl border border-gray-500/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 p-4 border-b border-gray-500/30">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          <span className="ml-3 text-gray-300 font-mono text-sm">Sovereignty Recovery Dashboard</span>
        </div>
      </div>

      {/* Main Simulation Area */}
      <div className="p-8 relative min-h-[400px] bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        {/* Background Grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Server Nodes */}
        <div className="relative z-10 flex justify-center gap-12 mb-8">
          {servers.map((server, index) => (
            <motion.div
              key={server.id}
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.2, type: "spring", stiffness: 200 }}
            >
              {/* Server Icon */}
              <motion.div
                className="relative mb-4"
                animate={{
                  scale: server.status === 'critical' ? [1, 1.1, 1] : 1,
                  rotate: server.status === 'critical' ? [0, -2, 2, 0] : 0
                }}
                transition={{
                  duration: server.status === 'critical' ? 0.5 : 0,
                  repeat: server.status === 'critical' ? Infinity : 0,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
                style={{ willChange: server.status === 'critical' ? 'transform' : 'auto' }}
              >
                <motion.div
                  className="w-16 h-16 rounded-lg flex items-center justify-center relative"
                  style={{
                    backgroundColor: `${getServerColor(server)}15`,
                    border: `2px solid ${getServerColor(server)}`,
                    boxShadow: getServerGlow(server)
                  }}
                  animate={{
                    boxShadow: server.status === 'critical'
                      ? ['0 0 20px #ef444440, 0 0 40px #ef444420', '0 0 40px #ef4444, 0 0 80px #ef444460']
                      : getServerGlow(server)
                  }}
                  transition={{
                    duration: 1,
                    repeat: server.status === 'critical' ? Infinity : 0,
                    repeatType: "reverse"
                  }}
                >
                  <Server
                    className="w-8 h-8"
                    style={{ color: getServerColor(server) }}
                  />

                  {/* Status Icons */}
                  <AnimatePresence>
                    {server.status === 'critical' && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        className="absolute -top-2 -right-2"
                      >
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      </motion.div>
                    )}

                    {server.status === 'healthy' && simulationStep === 4 && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute -top-2 -right-2"
                      >
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              {/* Server Name */}
              <div className="text-sm font-mono text-gray-400 mb-2">{server.name}</div>

              {/* Health Bar */}
              <div className="w-20 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: getServerColor(server) }}
                  animate={{ width: `${server.health}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>

              {/* Health Percentage */}
              <div
                className="text-xs font-mono mt-1 font-semibold"
                style={{ color: getServerColor(server) }}
              >
                {server.health}%
              </div>
            </motion.div>
          ))}
        </div>

        {/* HRM AI Agent */}
        <AnimatePresence>
          {hrmAgentActive && (
            <motion.div
              initial={{ x: -100, y: -100, scale: 0, rotate: -180 }}
              animate={{
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0,
                filter: recoveryInProgress
                  ? ["hue-rotate(0deg)", "hue-rotate(360deg)"]
                  : "hue-rotate(0deg)"
              }}
              exit={{ x: 100, y: -100, scale: 0, rotate: 180 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                filter: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear" // Smooth for 60fps
                }
              }}
              style={{
                willChange: recoveryInProgress ? 'transform, filter' : 'transform',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                className="relative"
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Agent Glow */}
                <div
                  className="absolute inset-0 rounded-full blur-xl opacity-60"
                  style={{
                    background: 'radial-gradient(circle, #8b5cf6 0%, #a78bfa 50%, transparent 100%)',
                    transform: 'scale(2)'
                  }}
                />

                {/* Agent Core */}
                <motion.div
                  className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center border-2 border-purple-300/50"
                  animate={{
                    boxShadow: [
                      '0 0 20px #8b5cf6, 0 0 40px #8b5cf640',
                      '0 0 30px #8b5cf6, 0 0 60px #8b5cf660',
                      '0 0 20px #8b5cf6, 0 0 40px #8b5cf640'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ willChange: 'box-shadow' }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>

                {/* Orbiting Particles */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-purple-400 rounded-full"
                    animate={{
                      rotate: 360,
                      scale: [0.5, 1, 0.5]
                    }}
                    transition={{
                      rotate: { duration: 2 + i * 0.5, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                    }}
                    style={{
                      transformOrigin: `${20 + i * 10}px center`
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Messages - Symmetrically Aligned */}
        <div className="relative z-20 mt-12">
          <AnimatePresence mode="wait">
            {simulationStep === 0 && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center max-w-md mx-auto"
                style={{ transform: 'translateZ(0)' }} // Hardware acceleration
              >
                <div className="text-gray-400 text-lg font-mono">
                  Sovereignty Infrastructure Online
                </div>
                <div className="text-green-400 text-sm mt-2">
                  All systems operational • HRM agents on standby
                </div>
              </motion.div>
            )}

            {simulationStep === 1 && (
              <motion.div
                key="failure"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center max-w-md mx-auto"
                style={{ transform: 'translateZ(0)' }}
              >
                <div className="text-red-400 text-lg font-mono flex items-center justify-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  SYSTEM FAILURE DETECTED
                </div>
                <div className="text-gray-300 text-sm mt-2">
                  api-prod-02 critical • Deploying HRM recovery agent...
                </div>
              </motion.div>
            )}

            {simulationStep === 2 && (
              <motion.div
                key="agent-deployed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center max-w-md mx-auto"
                style={{ transform: 'translateZ(0)' }}
              >
                <div className="text-purple-400 text-lg font-mono flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  HRM AGENT DEPLOYED
                </div>
                <div className="text-gray-300 text-sm mt-2">
                  Analyzing failure state • Preparing atomic rollback...
                </div>
              </motion.div>
            )}

            {simulationStep === 3 && (
              <motion.div
                key="recovery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center max-w-md mx-auto"
                style={{ transform: 'translateZ(0)' }}
              >
                <div className="text-purple-400 text-lg font-mono flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ willChange: 'transform' }}
                  >
                    <Zap className="w-5 h-5" />
                  </motion.div>
                  ATOMIC ROLLBACK IN PROGRESS
                </div>
                <div className="text-gray-300 text-sm mt-2">
                  Restoring to last known good state • Health increasing...
                </div>
              </motion.div>
            )}

            {simulationStep === 4 && (
              <motion.div
                key="recovered"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "drop-shadow(0 0 20px rgba(34, 197, 94, 0.3))"
                }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="text-center max-w-md mx-auto"
                style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
              >
                <motion.div
                  className="text-green-400 text-lg font-mono flex items-center justify-center gap-2"
                  animate={{
                    textShadow: [
                      "0 0 10px rgba(34, 197, 94, 0.5)",
                      "0 0 20px rgba(34, 197, 94, 0.8)",
                      "0 0 10px rgba(34, 197, 94, 0.5)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ willChange: 'transform' }}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </motion.div>
                  SYSTEM FULLY RECOVERED
                </motion.div>
                <div className="text-gray-300 text-sm mt-2">
                  100% health restored • HRM agent mission complete
                </div>

                {/* Performance Summary for Success State */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="mt-4 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg"
                >
                  <div className="text-xs text-green-300 font-mono">
                    Cycle #{cycleCount} • Recovery completed in {(160 * 0.2 / 1000).toFixed(1)}s •
                    {performanceMetrics.isMonitoring && ` ${performanceMetrics.fps}fps sustained •`}
                    {rollbackFpsCheckRef.current && (
                      <span className={performanceMetrics.rollbackFpsAlert ? 'text-yellow-300' : 'text-green-300'}>
                        {` Rollback: ${performanceMetrics.rollbackFpsAlert ? 'FPS dip detected' : '60fps locked'} •`}
                      </span>
                    )}
                    Memory usage: Optimal
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900/80 px-4 py-3 border-t border-gray-500/30">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Sovereignty Recovery • Live Simulation</span>
            {cycleCount > 0 && (
              <span className="flex items-center gap-2 text-blue-400">
                <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                Cycle #{cycleCount}
              </span>
            )}
            {performanceMetrics.isMonitoring && (
              <span className="flex items-center gap-2 text-purple-400">
                <span className="w-1 h-1 bg-purple-400 rounded-full animate-ping"></span>
                Performance Monitoring
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {performanceMetrics.isMonitoring && (
              <div className="flex items-center gap-2">
                <span className={`font-mono ${performanceMetrics.fps >= 58 ? 'text-green-400' : performanceMetrics.fps >= 45 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {performanceMetrics.fps}fps
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400 font-mono">
                  {performanceMetrics.frameTime}ms
                </span>
                {simulationStep === 3 && (
                  <span className="text-gray-600">•</span>
                )}
                {simulationStep === 3 && (
                  <span className={`font-mono text-xs ${performanceMetrics.rollbackFpsAlert ? 'text-red-400' : 'text-green-400'}`}>
                    {performanceMetrics.rollbackFpsAlert ? '⚠ ATOMIC ROLLBACK' : '✓ ATOMIC ROLLBACK'}
                  </span>
                )}
              </div>
            )}
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Real-time monitoring
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}