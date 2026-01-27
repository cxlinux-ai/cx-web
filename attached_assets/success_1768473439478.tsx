// pages/pricing/success.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function SuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (session_id) {
      // Verify session and show success
      setStatus('success');
    }
  }, [session_id]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center max-w-md">
        {status === 'success' ? (
          <>
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold mb-4">Welcome to Cortex Pro!</h1>
            <p className="text-gray-400 mb-8">
              Your 14-day free trial has started. Check your email for login instructions.
            </p>
            <div className="space-y-4">
              <a
                href="/docs/quickstart"
                className="block w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold"
              >
                Get Started →
              </a>
              <a
                href="/dashboard"
                className="block w-full py-3 bg-gray-800 rounded-lg font-semibold"
              >
                Go to Dashboard
              </a>
            </div>
          </>
        ) : (
          <div className="animate-pulse">
            <div className="text-4xl mb-4">⏳</div>
            <p>Confirming your subscription...</p>
          </div>
        )}
      </div>
    </div>
  );
}
