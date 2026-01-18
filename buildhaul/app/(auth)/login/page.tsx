'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, LoginInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) throw error

      toast.success('Logged in successfully')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to log in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="login-page" className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card id="login-card" className="w-full max-w-md">
        <CardHeader id="login-card-header" className="space-y-1">
          <div id="login-logo" className="flex items-center justify-center gap-2 mb-4">
            <Truck className="h-8 w-8 text-blue-900" />
            <span className="text-2xl font-bold text-blue-900">BuildHaul</span>
          </div>
          <CardTitle id="login-title" className="text-2xl text-center">Log In</CardTitle>
          <CardDescription id="login-description" className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent id="login-card-content">
          <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div id="login-email-field" className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div id="login-password-field" className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button
              id="login-submit-button"
              type="submit"
              className="w-full bg-blue-900 hover:bg-blue-800"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          <div id="login-footer-links" className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-900 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
