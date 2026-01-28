import SovereigntyRecoverySimulation from '../components/SovereigntyRecoverySimulation';

export default function SimulationTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Sovereignty Recovery Simulation
          </h1>
          <p className="text-xl text-gray-400">
            Live performance test with 60fps monitoring and continuous loops
          </p>
        </div>

        {/* Simulation Component */}
        <div className="flex justify-center">
          <SovereigntyRecoverySimulation />
        </div>

        {/* Performance Info */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Performance Test Instructions</h2>
            <div className="space-y-3 text-gray-300">
              <p>• <strong className="text-purple-400">Open Browser DevTools</strong> → Performance tab</p>
              <p>• <strong className="text-purple-400">Start Recording</strong> during the "Atomic Rollback" phase</p>
              <p>• <strong className="text-purple-400">Monitor FPS</strong> in the simulation footer (should stay ≥58fps)</p>
              <p>• <strong className="text-purple-400">Check Memory</strong> usage across multiple cycles</p>
              <p>• <strong className="text-purple-400">Verify Symmetry</strong> of the Success state layout</p>
            </div>

            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <h3 className="text-purple-400 font-semibold mb-2">Expected Results:</h3>
              <ul className="text-purple-200 space-y-1 text-sm">
                <li>✓ Locked 60fps during HRM Agent animations</li>
                <li>✓ Smooth Atomic Rollback sequence</li>
                <li>✓ Perfect symmetrical layout in Success state</li>
                <li>✓ Continuous loops without memory accumulation</li>
                <li>✓ Real-time performance monitoring display</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}