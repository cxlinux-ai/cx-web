import { useState } from "react";
import Footer from "@/components/Footer";
import { WaitlistSignup, ReferralDashboard, Leaderboard } from "@/components/referral";

export default function WaitlistPage() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  // Check URL for referral code on mount
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferralCode(ref);
    }

    // Check if user has their own referral code stored
    const storedCode = localStorage.getItem("cortex_referral_code");
    if (storedCode) {
      setShowDashboard(true);
      setReferralCode(storedCode);
    }
  });

  const handleSignupSuccess = (code: string) => {
    localStorage.setItem("cortex_referral_code", code);
    setReferralCode(code);
    setShowDashboard(true);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Join the <span className="text-blue-300">Cortex Linux</span> Waitlist
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get early access to the AI-native operating system. Refer friends to move up the list and unlock exclusive rewards.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {showDashboard && referralCode ? (
            <div className="space-y-12">
              {/* Dashboard */}
              <ReferralDashboard referralCode={referralCode} />

              {/* Leaderboard */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Top Referrers</h2>
                <Leaderboard />
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Signup Form */}
              <div>
                <WaitlistSignup
                  referredBy={referralCode || undefined}
                  onSuccess={handleSignupSuccess}
                />
              </div>

              {/* Benefits */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Why Join Early?</h2>

                <div className="space-y-4">
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">1</div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Priority Access</h3>
                        <p className="text-gray-400 text-sm">
                          Be among the first to experience the future of Linux with AI-powered natural language commands.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">2</div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Referral Rewards</h3>
                        <p className="text-gray-400 text-sm">
                          Earn tier badges, exclusive Discord roles, and Pro subscriptions by inviting friends.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">3</div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Skip the Line</h3>
                        <p className="text-gray-400 text-sm">
                          Each successful referral moves you up in the queue. Top referrers get VIP access.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">4</div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Shape the Product</h3>
                        <p className="text-gray-400 text-sm">
                          Early users get direct input into features and development priorities.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reward Tiers Preview */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Reward Tiers</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border border-amber-700/30 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">1</div>
                      <div className="text-xs text-amber-400 font-medium">Bronze</div>
                      <div className="text-xs text-gray-500">+100 spots</div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-400/20 to-gray-500/10 border border-gray-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">3</div>
                      <div className="text-xs text-gray-300 font-medium">Silver</div>
                      <div className="text-xs text-gray-500">+500 spots</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-600/30 to-yellow-700/10 border border-yellow-600/30 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">5</div>
                      <div className="text-xs text-yellow-400 font-medium">Gold</div>
                      <div className="text-xs text-gray-500">Discord Role</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Leaderboard Section (shown when not logged in) */}
      {!showDashboard && (
        <section className="py-16 px-4 bg-slate-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Leaderboard</h2>
            <p className="text-gray-400 text-center mb-8">See who's leading the referral race</p>
            <Leaderboard />
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
