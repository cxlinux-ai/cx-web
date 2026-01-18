import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Truck, Building2, Clock, Shield, DollarSign, MapPin } from 'lucide-react'

export default function HomePage() {
  return (
    <div id="home-page" className="min-h-screen bg-slate-50">
      {/* Header */}
      <header id="home-header" className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div id="home-logo" className="flex items-center gap-2">
            <Truck className="h-8 w-8 text-blue-900" />
            <span className="text-2xl font-bold text-blue-900">BuildHaul</span>
          </div>
          <nav id="home-nav" className="hidden md:flex gap-6">
            <Link href="#features" className="text-gray-600 hover:text-blue-900">Features</Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-blue-900">How It Works</Link>
            <Link href="/login" className="text-gray-600 hover:text-blue-900">Log In</Link>
          </nav>
          <Link href="/login">
            <Button id="home-login-button" variant="outline">Log In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero-section" className="py-20 md:py-32 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="container mx-auto px-4 text-center">
          <h1 id="hero-heading" className="text-4xl md:text-6xl font-bold text-white mb-6">
            The Fastest Way to Move Material
          </h1>
          <p id="hero-subheading" className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Connect with verified truckers instantly. Post a load, get it delivered.
          </p>
          <div id="hero-cta-buttons" className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register/poster">
              <Button id="hero-post-load-button" size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6">
                Post a Load
              </Button>
            </Link>
            <Link href="/register/driver">
              <Button id="hero-drive-button" size="lg" variant="outline" className="text-lg px-8 py-6 bg-white text-blue-900 hover:bg-gray-100">
                Drive with BuildHaul
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="social-proof-section" className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <p id="social-proof-text" className="text-center text-gray-600 mb-8">Trusted by leading construction companies</p>
          <div id="social-proof-companies" className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-2xl font-bold text-gray-400">Granite Construction</div>
            <div className="text-2xl font-bold text-gray-400">Staker Parson</div>
            <div className="text-2xl font-bold text-gray-400">Geneva Rock</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works-section" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-bold text-center mb-16 text-blue-900">
            How It Works
          </h2>
          <div id="how-it-works-steps" className="grid md:grid-cols-3 gap-12">
            <div id="how-it-works-step-1" className="text-center">
              <div className="bg-blue-900 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 text-blue-900">Post Your Load</h3>
              <p className="text-gray-600">Enter pickup and delivery details. Set your price or accept bids.</p>
            </div>
            <div id="how-it-works-step-2" className="text-center">
              <div className="bg-blue-900 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 text-blue-900">Get Matched</h3>
              <p className="text-gray-600">Verified truckers see your load and accept or bid instantly.</p>
            </div>
            <div id="how-it-works-step-3" className="text-center">
              <div className="bg-blue-900 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-blue-900">Track & Deliver</h3>
              <p className="text-gray-600">Real-time tracking. Payment processed automatically upon completion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Posters */}
      <section id="features-poster-section" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 id="features-poster-heading" className="text-3xl md:text-4xl font-bold mb-4 text-blue-900">
              For Construction Companies
            </h2>
            <p className="text-xl text-gray-600 mb-12">Everything you need to manage material hauling</p>
            <div id="features-poster-grid" className="grid md:grid-cols-2 gap-8">
              <div id="feature-poster-instant" className="flex gap-4">
                <div className="flex-shrink-0">
                  <Clock className="h-12 w-12 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-blue-900">Instant Matching</h3>
                  <p className="text-gray-600">Post a load and get responses within minutes. No more phone tag.</p>
                </div>
              </div>
              <div id="feature-poster-verified" className="flex gap-4">
                <div className="flex-shrink-0">
                  <Shield className="h-12 w-12 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-blue-900">Verified Truckers</h3>
                  <p className="text-gray-600">CDL verified. Insurance verified. Rating system ensures quality.</p>
                </div>
              </div>
              <div id="feature-poster-tracking" className="flex gap-4">
                <div className="flex-shrink-0">
                  <MapPin className="h-12 w-12 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-blue-900">Real-time Tracking</h3>
                  <p className="text-gray-600">Know exactly when material will arrive. Live location updates.</p>
                </div>
              </div>
              <div id="feature-poster-payments" className="flex gap-4">
                <div className="flex-shrink-0">
                  <DollarSign className="h-12 w-12 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-blue-900">Simple Payments</h3>
                  <p className="text-gray-600">Pay securely through the platform. Automatic invoicing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Drivers */}
      <section id="features-driver-section" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 id="features-driver-heading" className="text-3xl md:text-4xl font-bold mb-4 text-blue-900">
              For Truckers
            </h2>
            <p className="text-xl text-gray-600 mb-12">Find loads. Make money. Get paid fast.</p>
            <div id="features-driver-grid" className="grid md:grid-cols-2 gap-8">
              <div id="feature-driver-loads" className="flex gap-4">
                <div className="flex-shrink-0">
                  <MapPin className="h-12 w-12 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-blue-900">Loads Near You</h3>
                  <p className="text-gray-600">Map view shows available loads in your area. Filter by type and pay.</p>
                </div>
              </div>
              <div id="feature-driver-accept" className="flex gap-4">
                <div className="flex-shrink-0">
                  <Clock className="h-12 w-12 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-blue-900">One-Tap Accept</h3>
                  <p className="text-gray-600">See a load you want? Accept it instantly. No waiting for callbacks.</p>
                </div>
              </div>
              <div id="feature-driver-companies" className="flex gap-4">
                <div className="flex-shrink-0">
                  <Building2 className="h-12 w-12 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-blue-900">Work with Top Companies</h3>
                  <p className="text-gray-600">Access loads from major contractors. Build long-term relationships.</p>
                </div>
              </div>
              <div id="feature-driver-payout" className="flex gap-4">
                <div className="flex-shrink-0">
                  <DollarSign className="h-12 w-12 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-blue-900">Fast Payouts</h3>
                  <p className="text-gray-600">Get paid automatically when load completes. Instant payout option available.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section id="cta-banner-section" className="py-20 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="container mx-auto px-4 text-center">
          <h2 id="cta-banner-heading" className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p id="cta-banner-text" className="text-xl text-blue-100 mb-10">
            Join thousands of companies and drivers moving material faster.
          </p>
          <div id="cta-banner-buttons" className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register/poster">
              <Button id="cta-post-load-button" size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6">
                Post a Load
              </Button>
            </Link>
            <Link href="/register/driver">
              <Button id="cta-drive-button" size="lg" variant="outline" className="text-lg px-8 py-6 bg-white text-blue-900 hover:bg-gray-100">
                Drive with BuildHaul
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="home-footer" className="py-12 bg-slate-900 text-slate-300">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div id="footer-brand">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-6 w-6 text-orange-500" />
                <span className="text-xl font-bold text-white">BuildHaul</span>
              </div>
              <p className="text-sm">The marketplace for construction hauling.</p>
            </div>
            <div id="footer-company">
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div id="footer-resources">
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/safety" className="hover:text-white">Safety</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
            <div id="footer-contact">
              <h4 className="font-bold text-white mb-4">Contact</h4>
              <p className="text-sm">support@buildhaul.com</p>
              <p className="text-sm">1-800-HAUL-HUB</p>
            </div>
          </div>
          <div id="footer-copyright" className="mt-12 pt-8 border-t border-slate-800 text-center text-sm">
            <p>&copy; 2026 BuildHaul. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
