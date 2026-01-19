'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Truck, Building2, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-buildhaul-navy flex items-center justify-center p-4 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-buildhaul-navy dark:to-buildhaul-slate" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-radial from-buildhaul-orange/10 via-transparent to-transparent blur-3xl" />

      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-2xl z-10">
        <div className="bg-white dark:bg-buildhaul-slate/50 backdrop-blur-xl rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20 border border-slate-200 dark:border-white/10 p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-buildhaul-orange to-orange-600 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-buildhaul-navy dark:text-white">
              Build<span className="text-buildhaul-orange">Haul</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-center text-buildhaul-navy dark:text-white mb-2">
            Create an Account
          </h1>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
            Choose how you want to use BuildHaul
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/register/poster" className="group">
              <div className="cursor-pointer hover:scale-105 transition-transform h-full p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-buildhaul-orange dark:hover:border-buildhaul-orange bg-white dark:bg-slate-800/30 hover:shadow-lg">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-colors">
                    <Building2 className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-buildhaul-navy dark:text-white">
                      I Need Loads Delivered
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Post loads, hire verified truckers, track deliveries
                    </p>
                  </div>
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    Register as Company
                  </Button>
                </div>
              </div>
            </Link>

            <Link href="/register/driver" className="group">
              <div className="cursor-pointer hover:scale-105 transition-transform h-full p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-buildhaul-orange dark:hover:border-buildhaul-orange bg-white dark:bg-slate-800/30 hover:shadow-lg">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-buildhaul-orange/10 dark:bg-buildhaul-orange/20 rounded-2xl flex items-center justify-center group-hover:bg-buildhaul-orange/20 dark:group-hover:bg-buildhaul-orange/30 transition-colors">
                    <User className="h-8 w-8 text-buildhaul-orange" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-buildhaul-navy dark:text-white">
                      I Haul Loads
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Find loads near you, make money, get paid fast
                    </p>
                  </div>
                  <Button className="w-full bg-buildhaul-orange hover:bg-orange-600 text-white">
                    Register as Driver
                  </Button>
                </div>
              </div>
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-buildhaul-orange hover:text-orange-600 font-medium transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
