import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Truck, Building2, Clock, Shield, DollarSign, MapPin, Star, TrendingUp, Users, CheckCircle2, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div id="home-page" className="min-h-screen bg-buildhaul-concrete dark:bg-buildhaul-navy">
      {/* Fixed Navigation */}
      <header id="home-header" className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/20 dark:border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" id="home-logo" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-buildhaul-orange/10 group-hover:bg-buildhaul-orange/20 transition-colors">
              <Truck className="h-6 w-6 text-buildhaul-orange" />
            </div>
            <span className="text-2xl font-bold text-buildhaul-navy dark:text-white">BuildHaul</span>
          </Link>
          <nav id="home-nav" className="hidden md:flex gap-6 items-center">
            <Link href="#features" className="text-slate-600 dark:text-slate-300 hover:text-buildhaul-orange transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-buildhaul-orange transition-colors">How It Works</Link>
            <Link href="#testimonials" className="text-slate-600 dark:text-slate-300 hover:text-buildhaul-orange transition-colors">Reviews</Link>
            <Link href="/login" className="text-slate-600 dark:text-slate-300 hover:text-buildhaul-orange transition-colors">Log In</Link>
            <ThemeToggle />
          </nav>
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <ThemeToggle />
            </div>
            <Link href="/login">
              <Button id="home-login-button" variant="outline" className="hidden md:inline-flex border-slate-300 dark:border-slate-700">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero-section" className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-hero-gradient-light dark:bg-hero-gradient">
        <div className="absolute inset-0 grid-pattern opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <TrendingUp className="h-4 w-4 text-buildhaul-green" />
              <span className="text-sm font-medium text-white">Trusted by 500+ construction companies</span>
            </div>
            <h1 id="hero-heading" className="text-5xl md:text-7xl font-bold text-white mb-6 animate-slide-up">
              Move Material.<br />
              <span className="text-buildhaul-orange">Move Fast.</span>
            </h1>
            <p id="hero-subheading" className="text-xl md:text-2xl text-blue-100 dark:text-slate-300 mb-10 max-w-3xl mx-auto">
              The construction hauling marketplace connecting verified truckers with jobs instantly. Post a load, track delivery, get paid.
            </p>
            <div id="hero-cta-buttons" className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register/poster">
                <Button id="hero-post-load-button" size="lg" className="bg-buildhaul-orange hover:bg-buildhaul-orange/90 text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all group">
                  Post a Load
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/register/driver">
                <Button id="hero-drive-button" size="lg" variant="outline" className="text-lg px-8 py-6 glass hover:bg-white/20 text-white border-white/30 hover:border-white/50 transition-all">
                  Drive with BuildHaul
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-buildhaul-concrete dark:from-buildhaul-navy to-transparent"></div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="py-12 bg-white dark:bg-buildhaul-slate/30 border-y border-slate-200 dark:border-white/10">
        <div className="container mx-auto px-4">
          <div id="stats-grid" className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div id="stat-loads" className="text-center">
              <div className="text-4xl font-bold text-buildhaul-orange mb-2">15K+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Loads Delivered</div>
            </div>
            <div id="stat-truckers" className="text-center">
              <div className="text-4xl font-bold text-buildhaul-orange mb-2">2,500+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Verified Truckers</div>
            </div>
            <div id="stat-companies" className="text-center">
              <div className="text-4xl font-bold text-buildhaul-orange mb-2">500+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Construction Companies</div>
            </div>
            <div id="stat-rating" className="text-center">
              <div className="text-4xl font-bold text-buildhaul-orange mb-2">4.9★</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works-section" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 id="how-it-works-heading" className="text-4xl md:text-5xl font-bold mb-4 text-buildhaul-navy dark:text-white">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Three simple steps to get your material moving
            </p>
          </div>
          <div id="how-it-works-steps" className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div id="how-it-works-step-1" className="relative group">
              <div className="glass p-8 rounded-2xl hover:scale-105 transition-transform">
                <div className="bg-buildhaul-orange text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-6">
                  1
                </div>
                <h3 className="text-2xl font-bold mb-3 text-buildhaul-navy dark:text-white">Post Your Load</h3>
                <p className="text-slate-600 dark:text-slate-400">Enter pickup and delivery details. Set your price or accept bids. Takes 60 seconds.</p>
              </div>
            </div>
            <div id="how-it-works-step-2" className="relative group">
              <div className="glass p-8 rounded-2xl hover:scale-105 transition-transform">
                <div className="bg-buildhaul-orange text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-2xl font-bold mb-3 text-buildhaul-navy dark:text-white">Get Matched</h3>
                <p className="text-slate-600 dark:text-slate-400">Verified truckers see your load instantly. Average match time: 8 minutes.</p>
              </div>
            </div>
            <div id="how-it-works-step-3" className="relative group">
              <div className="glass p-8 rounded-2xl hover:scale-105 transition-transform">
                <div className="bg-buildhaul-orange text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-6">
                  3
                </div>
                <h3 className="text-2xl font-bold mb-3 text-buildhaul-navy dark:text-white">Track & Complete</h3>
                <p className="text-slate-600 dark:text-slate-400">Real-time GPS tracking. Automatic payment upon delivery confirmation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Companies */}
      <section id="features-poster-section" className="py-20 md:py-32 bg-white dark:bg-buildhaul-slate/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 id="features-poster-heading" className="text-4xl md:text-5xl font-bold mb-6 text-buildhaul-navy dark:text-white">
                  For Construction Companies
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                  Stop wasting time coordinating truckers. Focus on building.
                </p>
                <div id="features-poster-grid" className="space-y-6">
                  <div id="feature-poster-instant" className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-lg bg-buildhaul-orange/10">
                        <Clock className="h-6 w-6 text-buildhaul-orange" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-buildhaul-navy dark:text-white">Instant Matching</h3>
                      <p className="text-slate-600 dark:text-slate-400">Average response time: 8 minutes. No more phone tag or waiting on callbacks.</p>
                    </div>
                  </div>
                  <div id="feature-poster-verified" className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-lg bg-buildhaul-green/10">
                        <Shield className="h-6 w-6 text-buildhaul-green" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-buildhaul-navy dark:text-white">100% Verified Truckers</h3>
                      <p className="text-slate-600 dark:text-slate-400">CDL verified. Insurance checked. Background screened. Rating system ensures quality.</p>
                    </div>
                  </div>
                  <div id="feature-poster-tracking" className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <MapPin className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-buildhaul-navy dark:text-white">Real-time GPS Tracking</h3>
                      <p className="text-slate-600 dark:text-slate-400">Know exactly when material arrives. Live location updates. ETA notifications.</p>
                    </div>
                  </div>
                  <div id="feature-poster-payments" className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-lg bg-buildhaul-yellow/10">
                        <DollarSign className="h-6 w-6 text-buildhaul-yellow" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-buildhaul-navy dark:text-white">Automatic Payments</h3>
                      <p className="text-slate-600 dark:text-slate-400">Pay securely through the platform. Digital invoicing. No paperwork.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="glass p-8 rounded-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-buildhaul-orange/10 rounded-lg">
                      <span className="font-semibold text-buildhaul-navy dark:text-white">Avg. Match Time</span>
                      <span className="text-2xl font-bold text-buildhaul-orange">8 min</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-buildhaul-green/10 rounded-lg">
                      <span className="font-semibold text-buildhaul-navy dark:text-white">Cost Savings</span>
                      <span className="text-2xl font-bold text-buildhaul-green">35%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg">
                      <span className="font-semibold text-buildhaul-navy dark:text-white">Time Saved</span>
                      <span className="text-2xl font-bold text-blue-500">12 hrs/wk</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Drivers */}
      <section id="features-driver-section" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1 relative">
                <div className="glass p-8 rounded-2xl">
                  <div className="space-y-4">
                    <div className="p-4 bg-buildhaul-orange/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-buildhaul-orange" />
                        <span className="font-semibold text-buildhaul-navy dark:text-white">Available Loads</span>
                      </div>
                      <div className="text-3xl font-bold text-buildhaul-orange">127 near you</div>
                    </div>
                    <div className="p-4 bg-buildhaul-green/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-buildhaul-green" />
                        <span className="font-semibold text-buildhaul-navy dark:text-white">Avg. Earnings</span>
                      </div>
                      <div className="text-3xl font-bold text-buildhaul-green">$285/load</div>
                    </div>
                    <div className="p-4 bg-blue-500/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold text-buildhaul-navy dark:text-white">Payout Speed</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-500">Same Day</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h2 id="features-driver-heading" className="text-4xl md:text-5xl font-bold mb-6 text-buildhaul-navy dark:text-white">
                  For Truckers
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                  Find loads. Make money. Get paid fast. It's that simple.
                </p>
                <div id="features-driver-grid" className="space-y-6">
                  <div id="feature-driver-loads" className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-lg bg-buildhaul-orange/10">
                        <MapPin className="h-6 w-6 text-buildhaul-orange" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-buildhaul-navy dark:text-white">Loads Near You</h3>
                      <p className="text-slate-600 dark:text-slate-400">Interactive map shows available loads in your area. Filter by material type, pay, and distance.</p>
                    </div>
                  </div>
                  <div id="feature-driver-accept" className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-lg bg-buildhaul-green/10">
                        <CheckCircle2 className="h-6 w-6 text-buildhaul-green" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-buildhaul-navy dark:text-white">One-Tap Accept</h3>
                      <p className="text-slate-600 dark:text-slate-400">See a load you want? Accept it instantly. Job is yours. No waiting.</p>
                    </div>
                  </div>
                  <div id="feature-driver-companies" className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <Building2 className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-buildhaul-navy dark:text-white">Work with Top Companies</h3>
                      <p className="text-slate-600 dark:text-slate-400">Access loads from major contractors. Build relationships. Get repeat business.</p>
                    </div>
                  </div>
                  <div id="feature-driver-payout" className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-lg bg-buildhaul-yellow/10">
                        <DollarSign className="h-6 w-6 text-buildhaul-yellow" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-buildhaul-navy dark:text-white">Same-Day Payouts</h3>
                      <p className="text-slate-600 dark:text-slate-400">Automatic payment when load completes. Instant payout option for a small fee.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials-section" className="py-20 md:py-32 bg-white dark:bg-buildhaul-slate/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-buildhaul-navy dark:text-white">
              What Our Users Say
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Trusted by construction professionals across the country
            </p>
          </div>
          <div id="testimonials-grid" className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div id="testimonial-1" className="glass p-6 rounded-2xl">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-buildhaul-yellow text-buildhaul-yellow" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                "BuildHaul saved us 12 hours per week on hauling coordination. We've cut our material delivery costs by 30%. Game changer."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-buildhaul-orange/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-buildhaul-orange" />
                </div>
                <div>
                  <div className="font-semibold text-buildhaul-navy dark:text-white">Sarah Johnson</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Project Manager, Granite Construction</div>
                </div>
              </div>
            </div>
            <div id="testimonial-2" className="glass p-6 rounded-2xl">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-buildhaul-yellow text-buildhaul-yellow" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                "I'm making 40% more than I did with traditional dispatch. The app is simple, payments are fast, and I always know what I'm getting paid."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-buildhaul-green/20 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-buildhaul-green" />
                </div>
                <div>
                  <div className="font-semibold text-buildhaul-navy dark:text-white">Mike Rodriguez</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Owner-Operator, 8 years experience</div>
                </div>
              </div>
            </div>
            <div id="testimonial-3" className="glass p-6 rounded-2xl">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-buildhaul-yellow text-buildhaul-yellow" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                "The verification process gave us peace of mind. Every trucker is CDL verified and insured. We've had zero issues in 6 months."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="font-semibold text-buildhaul-navy dark:text-white">David Chen</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Operations Director, Staker Parson</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section id="cta-banner-section" className="py-20 md:py-32 relative overflow-hidden bg-hero-gradient-light dark:bg-hero-gradient">
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 id="cta-banner-heading" className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Move Faster?
          </h2>
          <p id="cta-banner-text" className="text-xl text-blue-100 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of companies and drivers who are already moving material the modern way.
          </p>
          <div id="cta-banner-buttons" className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register/poster">
              <Button id="cta-post-load-button" size="lg" className="bg-buildhaul-orange hover:bg-buildhaul-orange/90 text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all group">
                Post Your First Load
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/register/driver">
              <Button id="cta-drive-button" size="lg" variant="outline" className="text-lg px-8 py-6 glass hover:bg-white/20 text-white border-white/30 hover:border-white/50 transition-all">
                Start Driving Today
              </Button>
            </Link>
          </div>
          <p className="text-sm text-blue-200 dark:text-slate-400 mt-8">
            No credit card required • Free to sign up • Takes 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="home-footer" className="py-12 bg-buildhaul-navy dark:bg-black border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div id="footer-brand">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-buildhaul-orange/10">
                  <Truck className="h-5 w-5 text-buildhaul-orange" />
                </div>
                <span className="text-xl font-bold text-white">BuildHaul</span>
              </div>
              <p className="text-sm text-slate-400">The modern marketplace for construction hauling.</p>
            </div>
            <div id="footer-company">
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-slate-400 hover:text-buildhaul-orange transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-slate-400 hover:text-buildhaul-orange transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="text-slate-400 hover:text-buildhaul-orange transition-colors">Careers</Link></li>
                <li><Link href="/press" className="text-slate-400 hover:text-buildhaul-orange transition-colors">Press</Link></li>
              </ul>
            </div>
            <div id="footer-resources">
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="text-slate-400 hover:text-buildhaul-orange transition-colors">Help Center</Link></li>
                <li><Link href="/safety" className="text-slate-400 hover:text-buildhaul-orange transition-colors">Safety</Link></li>
                <li><Link href="/terms" className="text-slate-400 hover:text-buildhaul-orange transition-colors">Terms</Link></li>
                <li><Link href="/privacy" className="text-slate-400 hover:text-buildhaul-orange transition-colors">Privacy</Link></li>
              </ul>
            </div>
            <div id="footer-contact">
              <h4 className="font-bold text-white mb-4">Contact</h4>
              <div className="space-y-2 text-sm">
                <p className="text-slate-400">support@buildhaul.com</p>
                <p className="text-slate-400">1-800-HAUL-HUB</p>
                <div className="flex gap-3 mt-4">
                  <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-buildhaul-orange/20 flex items-center justify-center text-slate-400 hover:text-buildhaul-orange transition-colors">
                    <Users className="h-4 w-4" />
                  </a>
                  <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-buildhaul-orange/20 flex items-center justify-center text-slate-400 hover:text-buildhaul-orange transition-colors">
                    <Star className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div id="footer-copyright" className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>&copy; 2026 BuildHaul. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-buildhaul-orange transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-buildhaul-orange transition-colors">Privacy</Link>
              <Link href="/cookies" className="hover:text-buildhaul-orange transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
