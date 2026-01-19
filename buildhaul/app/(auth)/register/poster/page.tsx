// @ts-nocheck
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { registerSchema, companySchema, RegisterInput, CompanyInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, Eye, EyeOff } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { toast } from 'sonner'

export default function PosterRegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
    register: registerCompany,
    handleSubmit: handleCompanySubmit,
    setValue: setCompanyValue,
    formState: { errors: companyErrors },
  } = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
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

      // Update profile with role
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: authData.user.email!,
          role: 'poster',
          full_name: data.fullName,
          phone: data.phone,
        })

      if (profileError) throw profileError

      setUserId(authData.user.id)
      setStep(2)
      toast.success('Account created! Now set up your company.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const onCompanySubmit = async (data: CompanyInput) => {
    try {
      setLoading(true)
      const { error } = await supabase.from('companies').insert({
        owner_id: userId,
        name: data.name,
        business_type: data.businessType,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        phone: data.phone,
        email: data.email,
      })

      if (error) throw error

      toast.success('Company registered successfully!')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create company')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="poster-register-page" className="min-h-screen bg-slate-50 dark:bg-buildhaul-navy flex items-center justify-center p-4 transition-colors relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-buildhaul-navy dark:to-buildhaul-slate" />
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Card id="poster-register-card" className="w-full max-w-2xl relative z-10 bg-white dark:bg-buildhaul-slate/50 backdrop-blur-xl border-slate-200 dark:border-white/10">
        <CardHeader id="poster-register-header">
          <div id="poster-register-logo" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-buildhaul-orange to-orange-600 rounded-xl flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-buildhaul-navy dark:text-white">
              Build<span className="text-buildhaul-orange">Haul</span>
            </span>
          </div>
          <CardTitle id="poster-register-title" className="text-2xl text-center text-buildhaul-navy dark:text-white">
            {step === 1 ? 'Create Your Account' : 'Set Up Your Company'}
          </CardTitle>
          <CardDescription id="poster-register-description" className="text-center dark:text-slate-400">
            {step === 1 ? 'Step 1 of 2: Personal Information' : 'Step 2 of 2: Company Details'}
          </CardDescription>
        </CardHeader>
        <CardContent id="poster-register-content">
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
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} {...registerUser('password')} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {userErrors.password && (
                    <p className="text-sm text-red-600">{userErrors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} {...registerUser('confirmPassword')} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {userErrors.confirmPassword && (
                    <p className="text-sm text-red-600">{userErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <Button id="user-submit-button" type="submit" className="w-full bg-buildhaul-orange hover:bg-orange-600" disabled={loading}>
                {loading ? 'Creating Account...' : 'Continue'}
              </Button>
            </form>
          ) : (
            <form id="company-registration-form" onSubmit={handleCompanySubmit(onCompanySubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" {...registerCompany('name')} />
                {companyErrors.name && (
                  <p className="text-sm text-red-600">{companyErrors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select onValueChange={(value) => setCompanyValue('businessType', value as any)}>
                  <SelectTrigger id="businessType">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general_contractor">General Contractor</SelectItem>
                    <SelectItem value="material_supplier">Material Supplier</SelectItem>
                    <SelectItem value="mining">Mining</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {companyErrors.businessType && (
                  <p className="text-sm text-red-600">{companyErrors.businessType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...registerCompany('address')} />
                {companyErrors.address && (
                  <p className="text-sm text-red-600">{companyErrors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...registerCompany('city')} />
                  {companyErrors.city && (
                    <p className="text-sm text-red-600">{companyErrors.city.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" maxLength={2} {...registerCompany('state')} />
                  {companyErrors.state && (
                    <p className="text-sm text-red-600">{companyErrors.state.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP</Label>
                  <Input id="zip" {...registerCompany('zip')} />
                  {companyErrors.zip && (
                    <p className="text-sm text-red-600">{companyErrors.zip.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input id="companyPhone" type="tel" {...registerCompany('phone')} />
                  {companyErrors.phone && (
                    <p className="text-sm text-red-600">{companyErrors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input id="companyEmail" type="email" {...registerCompany('email')} />
                  {companyErrors.email && (
                    <p className="text-sm text-red-600">{companyErrors.email.message}</p>
                  )}
                </div>
              </div>

              <Button id="company-submit-button" type="submit" className="w-full bg-buildhaul-orange hover:bg-orange-600" disabled={loading}>
                {loading ? 'Creating Company...' : 'Complete Registration'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
