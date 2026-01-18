'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, Building2, User } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div id="register-page" className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card id="register-card" className="w-full max-w-2xl">
        <CardHeader id="register-card-header" className="space-y-1">
          <div id="register-logo" className="flex items-center justify-center gap-2 mb-4">
            <Truck className="h-8 w-8 text-blue-900" />
            <span className="text-2xl font-bold text-blue-900">BuildHaul</span>
          </div>
          <CardTitle id="register-title" className="text-2xl text-center">Create an Account</CardTitle>
          <CardDescription id="register-description" className="text-center">
            Choose how you want to use BuildHaul
          </CardDescription>
        </CardHeader>
        <CardContent id="register-card-content">
          <div id="register-options" className="grid md:grid-cols-2 gap-6">
            <Link href="/register/poster">
              <Card id="register-poster-card" className="cursor-pointer hover:border-blue-900 hover:shadow-lg transition-all h-full">
                <CardContent id="register-poster-content" className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="bg-blue-900 text-white rounded-full p-4">
                      <Building2 className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">I Need Loads Delivered</h3>
                      <p className="text-sm text-gray-600">
                        Post loads, hire verified truckers, track deliveries
                      </p>
                    </div>
                    <Button id="register-poster-button" className="w-full bg-blue-900 hover:bg-blue-800">
                      Register as Company
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/register/driver">
              <Card id="register-driver-card" className="cursor-pointer hover:border-orange-500 hover:shadow-lg transition-all h-full">
                <CardContent id="register-driver-content" className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="bg-orange-500 text-white rounded-full p-4">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">I Haul Loads</h3>
                      <p className="text-sm text-gray-600">
                        Find loads near you, make money, get paid fast
                      </p>
                    </div>
                    <Button id="register-driver-button" className="w-full bg-orange-500 hover:bg-orange-600">
                      Register as Driver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div id="register-footer-links" className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-900 font-medium hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
