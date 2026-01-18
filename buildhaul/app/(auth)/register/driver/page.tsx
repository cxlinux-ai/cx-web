// @ts-nocheck
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { registerSchema, driverSchema, RegisterInput, DriverInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck } from 'lucide-react'
import { toast } from 'sonner'

export default function DriverRegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  const {
    register: registerUser,
    handleSubmit: handleUserSubmit,
    formState: { errors: userErrors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const {
    register: registerDriver,
    handleSubmit: handleDriverSubmit,
    setValue,
    formState: { errors: driverErrors },
  } = useForm<DriverInput>({
    resolver: zodResolver(driverSchema),
  })

  const onUserSubmit = async (data: RegisterInput) => {
    try {
      setLoading(true)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: authData.user.email!,
          role: 'driver',
          full_name: data.fullName,
          phone: data.phone,
        })

      if (profileError) throw profileError

      setUserId(authData.user.id)
      setStep(2)
      toast.success('Account created! Now complete your driver profile.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const onDriverSubmit = async (data: DriverInput) => {
    try {
      setLoading(true)
      const { error } = await supabase.from('drivers').insert({
        profile_id: userId,
        company_name: data.companyName,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        cdl_number: data.cdlNumber,
        cdl_state: data.cdlState,
        cdl_expiry: data.cdlExpiry,
        years_experience: data.yearsExperience,
        service_radius_miles: data.serviceRadiusMiles,
      })

      if (error) throw error

      toast.success('Driver profile created! Add your truck next.')
      router.push('/trucks?onboarding=true')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create driver profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="driver-register-page" className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card id="driver-register-card" className="w-full max-w-2xl">
        <CardHeader id="driver-register-header">
          <div id="driver-register-logo" className="flex items-center justify-center gap-2 mb-4">
            <Truck className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold text-blue-900">BuildHaul</span>
          </div>
          <CardTitle id="driver-register-title" className="text-2xl text-center">
            {step === 1 ? 'Create Your Account' : 'Complete Driver Profile'}
          </CardTitle>
          <CardDescription id="driver-register-description" className="text-center">
            {step === 1 ? 'Step 1 of 2: Personal Information' : 'Step 2 of 2: Driver Details & CDL'}
          </CardDescription>
        </CardHeader>
        <CardContent id="driver-register-content">
          {step === 1 ? (
            <form id="user-registration-form" onSubmit={handleUserSubmit(onUserSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" {...registerUser('fullName')} />
                  {userErrors.fullName && (
                    <p className="text-sm text-red-600">{userErrors.fullName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" {...registerUser('phone')} />
                  {userErrors.phone && (
                    <p className="text-sm text-red-600">{userErrors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...registerUser('email')} />
                {userErrors.email && (
                  <p className="text-sm text-red-600">{userErrors.email.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" {...registerUser('password')} />
                  {userErrors.password && (
                    <p className="text-sm text-red-600">{userErrors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" {...registerUser('confirmPassword')} />
                  {userErrors.confirmPassword && (
                    <p className="text-sm text-red-600">{userErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <Button id="user-submit-button" type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
                {loading ? 'Creating Account...' : 'Continue'}
              </Button>
            </form>
          ) : (
            <form id="driver-registration-form" onSubmit={handleDriverSubmit(onDriverSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name (Optional)</Label>
                <Input id="companyName" placeholder="Owner-Operator or Company Name" {...registerDriver('companyName')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...registerDriver('address')} />
                {driverErrors.address && (
                  <p className="text-sm text-red-600">{driverErrors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...registerDriver('city')} />
                  {driverErrors.city && (
                    <p className="text-sm text-red-600">{driverErrors.city.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" maxLength={2} {...registerDriver('state')} />
                  {driverErrors.state && (
                    <p className="text-sm text-red-600">{driverErrors.state.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP</Label>
                  <Input id="zip" {...registerDriver('zip')} />
                  {driverErrors.zip && (
                    <p className="text-sm text-red-600">{driverErrors.zip.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cdlNumber">CDL Number</Label>
                  <Input id="cdlNumber" {...registerDriver('cdlNumber')} />
                  {driverErrors.cdlNumber && (
                    <p className="text-sm text-red-600">{driverErrors.cdlNumber.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cdlState">CDL State</Label>
                  <Input id="cdlState" maxLength={2} {...registerDriver('cdlState')} />
                  {driverErrors.cdlState && (
                    <p className="text-sm text-red-600">{driverErrors.cdlState.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cdlExpiry">CDL Expiry</Label>
                  <Input id="cdlExpiry" type="date" {...registerDriver('cdlExpiry')} />
                  {driverErrors.cdlExpiry && (
                    <p className="text-sm text-red-600">{driverErrors.cdlExpiry.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Input id="yearsExperience" type="number" {...registerDriver('yearsExperience', { valueAsNumber: true })} />
                  {driverErrors.yearsExperience && (
                    <p className="text-sm text-red-600">{driverErrors.yearsExperience.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceRadiusMiles">Service Radius (miles)</Label>
                  <Input id="serviceRadiusMiles" type="number" defaultValue={50} {...registerDriver('serviceRadiusMiles', { valueAsNumber: true })} />
                  {driverErrors.serviceRadiusMiles && (
                    <p className="text-sm text-red-600">{driverErrors.serviceRadiusMiles.message}</p>
                  )}
                </div>
              </div>

              <Button id="driver-submit-button" type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
                {loading ? 'Creating Profile...' : 'Complete Registration'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
