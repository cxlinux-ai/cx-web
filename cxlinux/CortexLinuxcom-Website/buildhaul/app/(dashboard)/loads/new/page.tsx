'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Check, MapPin, Package, DollarSign, FileText } from 'lucide-react'
import { calculateDistance, geocodeAddress, coordinatesToGeography } from '@/lib/maps'

const materialSchema = z.object({
  materialType: z.enum(['aggregate', 'sand', 'gravel', 'asphalt', 'concrete', 'dirt', 'rock', 'topsoil', 'base_course', 'rip_rap', 'other']),
  materialDescription: z.string().optional(),
  weightTons: z.number().min(0.1).max(1000),
  truckTypeRequired: z.enum(['lowboy', 'end_dump', 'belly_dump', 'side_dump', 'flatbed', 'water_truck', 'other']),
  trucksNeeded: z.number().min(1).max(50),
})

const pickupSchema = z.object({
  pickupLocationName: z.string().min(2),
  pickupAddress: z.string().min(5),
  pickupCity: z.string().min(2),
  pickupState: z.string().length(2),
  pickupZip: z.string().regex(/^\d{5}(-\d{4})?$/),
  pickupTimeStart: z.string(),
  pickupTimeEnd: z.string(),
  pickupInstructions: z.string().optional(),
})

const deliverySchema = z.object({
  deliveryLocationName: z.string().min(2),
  deliveryAddress: z.string().min(5),
  deliveryCity: z.string().min(2),
  deliveryState: z.string().length(2),
  deliveryZip: z.string().regex(/^\d{5}(-\d{4})?$/),
  deliveryInstructions: z.string().optional(),
})

const pricingSchema = z.object({
  pricingType: z.enum(['fixed', 'hourly', 'per_ton', 'bid']),
  rateAmount: z.number().min(0),
  scheduledDate: z.string(),
  roundTrips: z.number().min(1).max(100),
  urgent: z.boolean(),
  notes: z.string().optional(),
})

type MaterialData = z.infer<typeof materialSchema>
type PickupData = z.infer<typeof pickupSchema>
type DeliveryData = z.infer<typeof deliverySchema>
type PricingData = z.infer<typeof pricingSchema>

interface FormData extends MaterialData, PickupData, DeliveryData, PricingData {}

export default function NewLoadPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<FormData>>({})
  const [distance, setDistance] = useState<number>(0)
  const [pickupCoords, setPickupCoords] = useState<{lat: number, lng: number} | null>(null)
  const [deliveryCoords, setDeliveryCoords] = useState<{lat: number, lng: number} | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const materialForm = useForm<MaterialData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      trucksNeeded: 1,
      ...formData as any,
    },
  })

  const pickupForm = useForm<PickupData>({
    resolver: zodResolver(pickupSchema),
    defaultValues: formData as any,
  })

  const deliveryForm = useForm<DeliveryData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: formData as any,
  })

  const pricingForm = useForm<PricingData>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      roundTrips: 1,
      urgent: false,
      ...formData as any,
    },
  })

  const onMaterialNext = async (data: MaterialData) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(2)
  }

  const onPickupNext = async (data: PickupData) => {
    setLoading(true)
    try {
      const fullAddress = `${data.pickupAddress}, ${data.pickupCity}, ${data.pickupState} ${data.pickupZip}`
      const coords = await geocodeAddress(fullAddress)

      if (!coords) {
        toast.error('Could not find pickup location. Please verify the address.')
        return
      }

      setPickupCoords(coords)
      setFormData(prev => ({ ...prev, ...data }))
      setStep(3)
    } catch (error) {
      toast.error('Error validating pickup address')
    } finally {
      setLoading(false)
    }
  }

  const onDeliveryNext = async (data: DeliveryData) => {
    setLoading(true)
    try {
      const fullAddress = `${data.deliveryAddress}, ${data.deliveryCity}, ${data.deliveryState} ${data.deliveryZip}`
      const coords = await geocodeAddress(fullAddress)

      if (!coords) {
        toast.error('Could not find delivery location. Please verify the address.')
        return
      }

      setDeliveryCoords(coords)

      if (pickupCoords && coords) {
        const dist = calculateDistance(pickupCoords, coords)
        setDistance(Math.round(dist * 10) / 10)
      }

      setFormData(prev => ({ ...prev, ...data }))
      setStep(4)
    } catch (error) {
      toast.error('Error validating delivery address')
    } finally {
      setLoading(false)
    }
  }

  const onPricingNext = (data: PricingData) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(5)
  }

  const onSubmit = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (!company) throw new Error('Company not found')

      const fullData = formData as FormData

      let estimatedTotal = 0
      if (fullData.pricingType === 'fixed') {
        estimatedTotal = fullData.rateAmount * fullData.roundTrips * fullData.trucksNeeded
      } else if (fullData.pricingType === 'per_ton') {
        estimatedTotal = fullData.rateAmount * fullData.weightTons * fullData.roundTrips * fullData.trucksNeeded
      } else {
        estimatedTotal = fullData.rateAmount
      }

      const { error } = await supabase.from('loads').insert({
        company_id: company.id,
        posted_by: user.id,
        status: 'posted',
        material_type: fullData.materialType,
        material_description: fullData.materialDescription,
        weight_tons: fullData.weightTons,
        truck_type_required: fullData.truckTypeRequired,
        trucks_needed: fullData.trucksNeeded,
        pickup_location_name: fullData.pickupLocationName,
        pickup_address: fullData.pickupAddress,
        pickup_city: fullData.pickupCity,
        pickup_state: fullData.pickupState,
        pickup_zip: fullData.pickupZip,
        pickup_coordinates: coordinatesToGeography(pickupCoords!),
        pickup_instructions: fullData.pickupInstructions,
        pickup_time_start: fullData.pickupTimeStart,
        pickup_time_end: fullData.pickupTimeEnd,
        delivery_location_name: fullData.deliveryLocationName,
        delivery_address: fullData.deliveryAddress,
        delivery_city: fullData.deliveryCity,
        delivery_state: fullData.deliveryState,
        delivery_zip: fullData.deliveryZip,
        delivery_coordinates: coordinatesToGeography(deliveryCoords!),
        delivery_instructions: fullData.deliveryInstructions,
        distance_miles: distance,
        scheduled_date: fullData.scheduledDate,
        pricing_type: fullData.pricingType,
        rate_amount: fullData.rateAmount,
        estimated_total: estimatedTotal,
        round_trips: fullData.roundTrips,
        urgent: fullData.urgent,
        notes: fullData.notes,
      })

      if (error) throw error

      toast.success('Load posted successfully!')
      router.push('/loads')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to post load')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, label: 'Material', icon: Package },
    { number: 2, label: 'Pickup', icon: MapPin },
    { number: 3, label: 'Delivery', icon: MapPin },
    { number: 4, label: 'Pricing', icon: DollarSign },
    { number: 5, label: 'Review', icon: FileText },
  ]

  return (
    <div id="new-load-page" className="max-w-4xl mx-auto space-y-6">
      <div id="new-load-header">
        <h1 className="text-3xl font-bold text-blue-900">Post New Load</h1>
        <p className="text-gray-600 mt-1">Fill out the details to post your load</p>
      </div>

      {/* Progress Steps */}
      <div id="progress-steps" className="flex items-center justify-between">
        {steps.map((s, idx) => {
          const Icon = s.icon
          const isActive = step === s.number
          const isCompleted = step > s.number

          return (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`rounded-full w-12 h-12 flex items-center justify-center border-2 transition-colors ${
                    isCompleted
                      ? 'bg-blue-900 border-blue-900 text-white'
                      : isActive
                      ? 'border-blue-900 text-blue-900 bg-white'
                      : 'border-gray-300 text-gray-400 bg-white'
                  }`}
                >
                  {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                </div>
                <span className={`text-sm mt-2 ${isActive || isCompleted ? 'text-blue-900 font-medium' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${step > s.number ? 'bg-blue-900' : 'bg-gray-300'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step 1: Material */}
      {step === 1 && (
        <Card id="step-material">
          <CardHeader>
            <CardTitle>Material Details</CardTitle>
            <CardDescription>Specify what needs to be hauled</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={materialForm.handleSubmit(onMaterialNext)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="materialType">Material Type *</Label>
                  <Select
                    value={materialForm.watch('materialType')}
                    onValueChange={(value) => materialForm.setValue('materialType', value as any)}
                  >
                    <SelectTrigger id="materialType">
                      <SelectValue placeholder="Select material type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aggregate">Aggregate</SelectItem>
                      <SelectItem value="sand">Sand</SelectItem>
                      <SelectItem value="gravel">Gravel</SelectItem>
                      <SelectItem value="asphalt">Asphalt</SelectItem>
                      <SelectItem value="concrete">Concrete</SelectItem>
                      <SelectItem value="dirt">Dirt</SelectItem>
                      <SelectItem value="rock">Rock</SelectItem>
                      <SelectItem value="topsoil">Topsoil</SelectItem>
                      <SelectItem value="base_course">Base Course</SelectItem>
                      <SelectItem value="rip_rap">Rip Rap</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {materialForm.formState.errors.materialType && (
                    <p className="text-sm text-red-600">{materialForm.formState.errors.materialType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="truckTypeRequired">Truck Type Required *</Label>
                  <Select
                    value={materialForm.watch('truckTypeRequired')}
                    onValueChange={(value) => materialForm.setValue('truckTypeRequired', value as any)}
                  >
                    <SelectTrigger id="truckTypeRequired">
                      <SelectValue placeholder="Select truck type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lowboy">Lowboy</SelectItem>
                      <SelectItem value="end_dump">End Dump</SelectItem>
                      <SelectItem value="belly_dump">Belly Dump</SelectItem>
                      <SelectItem value="side_dump">Side Dump</SelectItem>
                      <SelectItem value="flatbed">Flatbed</SelectItem>
                      <SelectItem value="water_truck">Water Truck</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {materialForm.formState.errors.truckTypeRequired && (
                    <p className="text-sm text-red-600">{materialForm.formState.errors.truckTypeRequired.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="materialDescription">Material Description (Optional)</Label>
                <Textarea
                  id="materialDescription"
                  placeholder="Additional details about the material..."
                  {...materialForm.register('materialDescription')}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weightTons">Weight (Tons) *</Label>
                  <Input
                    id="weightTons"
                    type="number"
                    step="0.1"
                    placeholder="25.0"
                    {...materialForm.register('weightTons', { valueAsNumber: true })}
                  />
                  {materialForm.formState.errors.weightTons && (
                    <p className="text-sm text-red-600">{materialForm.formState.errors.weightTons.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trucksNeeded">Number of Trucks *</Label>
                  <Input
                    id="trucksNeeded"
                    type="number"
                    min="1"
                    defaultValue={1}
                    {...materialForm.register('trucksNeeded', { valueAsNumber: true })}
                  />
                  {materialForm.formState.errors.trucksNeeded && (
                    <p className="text-sm text-red-600">{materialForm.formState.errors.trucksNeeded.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-blue-900 hover:bg-blue-800">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Pickup */}
      {step === 2 && (
        <Card id="step-pickup">
          <CardHeader>
            <CardTitle>Pickup Location</CardTitle>
            <CardDescription>Where should the material be picked up?</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={pickupForm.handleSubmit(onPickupNext)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickupLocationName">Location Name *</Label>
                <Input
                  id="pickupLocationName"
                  placeholder="Rio Tinto Quarry"
                  {...pickupForm.register('pickupLocationName')}
                />
                {pickupForm.formState.errors.pickupLocationName && (
                  <p className="text-sm text-red-600">{pickupForm.formState.errors.pickupLocationName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupAddress">Street Address *</Label>
                <Input
                  id="pickupAddress"
                  placeholder="12600 S 5600 W"
                  {...pickupForm.register('pickupAddress')}
                />
                {pickupForm.formState.errors.pickupAddress && (
                  <p className="text-sm text-red-600">{pickupForm.formState.errors.pickupAddress.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="pickupCity">City *</Label>
                  <Input id="pickupCity" {...pickupForm.register('pickupCity')} />
                  {pickupForm.formState.errors.pickupCity && (
                    <p className="text-sm text-red-600">{pickupForm.formState.errors.pickupCity.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupState">State *</Label>
                  <Input id="pickupState" maxLength={2} placeholder="UT" {...pickupForm.register('pickupState')} />
                  {pickupForm.formState.errors.pickupState && (
                    <p className="text-sm text-red-600">{pickupForm.formState.errors.pickupState.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupZip">ZIP *</Label>
                  <Input id="pickupZip" {...pickupForm.register('pickupZip')} />
                  {pickupForm.formState.errors.pickupZip && (
                    <p className="text-sm text-red-600">{pickupForm.formState.errors.pickupZip.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickupTimeStart">Pickup Window Start *</Label>
                  <Input id="pickupTimeStart" type="time" {...pickupForm.register('pickupTimeStart')} />
                  {pickupForm.formState.errors.pickupTimeStart && (
                    <p className="text-sm text-red-600">{pickupForm.formState.errors.pickupTimeStart.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupTimeEnd">Pickup Window End *</Label>
                  <Input id="pickupTimeEnd" type="time" {...pickupForm.register('pickupTimeEnd')} />
                  {pickupForm.formState.errors.pickupTimeEnd && (
                    <p className="text-sm text-red-600">{pickupForm.formState.errors.pickupTimeEnd.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupInstructions">Pickup Instructions (Optional)</Label>
                <Textarea
                  id="pickupInstructions"
                  placeholder="Gate code, contact person, special instructions..."
                  {...pickupForm.register('pickupInstructions')}
                />
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit" className="bg-blue-900 hover:bg-blue-800" disabled={loading}>
                  {loading ? 'Validating...' : 'Next'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Delivery */}
      {step === 3 && (
        <Card id="step-delivery">
          <CardHeader>
            <CardTitle>Delivery Location</CardTitle>
            <CardDescription>Where should the material be delivered?</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={deliveryForm.handleSubmit(onDeliveryNext)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryLocationName">Location Name *</Label>
                <Input
                  id="deliveryLocationName"
                  placeholder="I-15 Expansion Site 4"
                  {...deliveryForm.register('deliveryLocationName')}
                />
                {deliveryForm.formState.errors.deliveryLocationName && (
                  <p className="text-sm text-red-600">{deliveryForm.formState.errors.deliveryLocationName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Street Address *</Label>
                <Input
                  id="deliveryAddress"
                  placeholder="14400 S Bangerter Hwy"
                  {...deliveryForm.register('deliveryAddress')}
                />
                {deliveryForm.formState.errors.deliveryAddress && (
                  <p className="text-sm text-red-600">{deliveryForm.formState.errors.deliveryAddress.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="deliveryCity">City *</Label>
                  <Input id="deliveryCity" {...deliveryForm.register('deliveryCity')} />
                  {deliveryForm.formState.errors.deliveryCity && (
                    <p className="text-sm text-red-600">{deliveryForm.formState.errors.deliveryCity.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryState">State *</Label>
                  <Input id="deliveryState" maxLength={2} placeholder="UT" {...deliveryForm.register('deliveryState')} />
                  {deliveryForm.formState.errors.deliveryState && (
                    <p className="text-sm text-red-600">{deliveryForm.formState.errors.deliveryState.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryZip">ZIP *</Label>
                  <Input id="deliveryZip" {...deliveryForm.register('deliveryZip')} />
                  {deliveryForm.formState.errors.deliveryZip && (
                    <p className="text-sm text-red-600">{deliveryForm.formState.errors.deliveryZip.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
                <Textarea
                  id="deliveryInstructions"
                  placeholder="Gate code, contact person, special instructions..."
                  {...deliveryForm.register('deliveryInstructions')}
                />
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit" className="bg-blue-900 hover:bg-blue-800" disabled={loading}>
                  {loading ? 'Calculating...' : 'Next'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Pricing */}
      {step === 4 && (
        <Card id="step-pricing">
          <CardHeader>
            <CardTitle>Pricing & Schedule</CardTitle>
            <CardDescription>Set your pricing and delivery schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={pricingForm.handleSubmit(onPricingNext)} className="space-y-4">
              {distance > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Calculated Distance:</strong> {distance} miles
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricingType">Pricing Type *</Label>
                  <Select
                    value={pricingForm.watch('pricingType')}
                    onValueChange={(value) => pricingForm.setValue('pricingType', value as any)}
                  >
                    <SelectTrigger id="pricingType">
                      <SelectValue placeholder="Select pricing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                      <SelectItem value="per_ton">Per Ton</SelectItem>
                      <SelectItem value="bid">Accept Bids</SelectItem>
                    </SelectContent>
                  </Select>
                  {pricingForm.formState.errors.pricingType && (
                    <p className="text-sm text-red-600">{pricingForm.formState.errors.pricingType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rateAmount">
                    {pricingForm.watch('pricingType') === 'bid' ? 'Starting Bid' : 'Rate'} ($) *
                  </Label>
                  <Input
                    id="rateAmount"
                    type="number"
                    step="0.01"
                    placeholder="350.00"
                    {...pricingForm.register('rateAmount', { valueAsNumber: true })}
                  />
                  {pricingForm.formState.errors.rateAmount && (
                    <p className="text-sm text-red-600">{pricingForm.formState.errors.rateAmount.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    {...pricingForm.register('scheduledDate')}
                  />
                  {pricingForm.formState.errors.scheduledDate && (
                    <p className="text-sm text-red-600">{pricingForm.formState.errors.scheduledDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roundTrips">Round Trips *</Label>
                  <Input
                    id="roundTrips"
                    type="number"
                    min="1"
                    defaultValue={1}
                    {...pricingForm.register('roundTrips', { valueAsNumber: true })}
                  />
                  {pricingForm.formState.errors.roundTrips && (
                    <p className="text-sm text-red-600">{pricingForm.formState.errors.roundTrips.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    id="urgent"
                    type="checkbox"
                    className="rounded border-gray-300"
                    {...pricingForm.register('urgent')}
                  />
                  <Label htmlFor="urgent" className="cursor-pointer">
                    Mark as urgent (higher visibility to drivers)
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about this load..."
                  {...pricingForm.register('notes')}
                />
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit" className="bg-blue-900 hover:bg-blue-800">
                  Review <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <Card id="step-review">
          <CardHeader>
            <CardTitle>Review & Post</CardTitle>
            <CardDescription>Review all details before posting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Package className="h-5 w-5" /> Material Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Material:</span>{' '}
                  <span className="font-medium">{formData.materialType}</span>
                </div>
                <div>
                  <span className="text-gray-600">Truck Type:</span>{' '}
                  <span className="font-medium">{formData.truckTypeRequired}</span>
                </div>
                <div>
                  <span className="text-gray-600">Weight:</span>{' '}
                  <span className="font-medium">{formData.weightTons} tons</span>
                </div>
                <div>
                  <span className="text-gray-600">Trucks Needed:</span>{' '}
                  <span className="font-medium">{formData.trucksNeeded}</span>
                </div>
                {formData.materialDescription && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Description:</span>{' '}
                    <span className="font-medium">{formData.materialDescription}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" /> Pickup Location
              </h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{formData.pickupLocationName}</p>
                <p className="text-gray-600">
                  {formData.pickupAddress}, {formData.pickupCity}, {formData.pickupState} {formData.pickupZip}
                </p>
                <p className="text-gray-600">
                  Pickup window: {formData.pickupTimeStart} - {formData.pickupTimeEnd}
                </p>
                {formData.pickupInstructions && (
                  <p className="text-gray-600 italic">{formData.pickupInstructions}</p>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-600" /> Delivery Location
              </h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{formData.deliveryLocationName}</p>
                <p className="text-gray-600">
                  {formData.deliveryAddress}, {formData.deliveryCity}, {formData.deliveryState} {formData.deliveryZip}
                </p>
                {formData.deliveryInstructions && (
                  <p className="text-gray-600 italic">{formData.deliveryInstructions}</p>
                )}
              </div>
              {distance > 0 && (
                <div className="mt-2">
                  <Badge variant="outline">Distance: {distance} miles</Badge>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> Pricing & Schedule
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Pricing Type:</span>{' '}
                  <span className="font-medium capitalize">{formData.pricingType?.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-gray-600">Rate:</span>{' '}
                  <span className="font-medium">${formData.rateAmount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Scheduled Date:</span>{' '}
                  <span className="font-medium">
                    {formData.scheduledDate ? new Date(formData.scheduledDate).toLocaleDateString() : ''}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Round Trips:</span>{' '}
                  <span className="font-medium">{formData.roundTrips}</span>
                </div>
                {formData.urgent && (
                  <div className="col-span-2">
                    <Badge variant="destructive">Urgent</Badge>
                  </div>
                )}
                {formData.notes && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Notes:</span>{' '}
                    <span className="font-medium">{formData.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Estimated Total</h4>
              <p className="text-3xl font-bold text-blue-900">
                $
                {formData.pricingType === 'fixed'
                  ? ((formData.rateAmount || 0) * (formData.roundTrips || 1) * (formData.trucksNeeded || 1)).toFixed(2)
                  : formData.pricingType === 'per_ton'
                  ? ((formData.rateAmount || 0) * (formData.weightTons || 0) * (formData.roundTrips || 1) * (formData.trucksNeeded || 1)).toFixed(2)
                  : (formData.rateAmount || 0).toFixed(2)}
              </p>
              {formData.pricingType === 'bid' && (
                <p className="text-sm text-gray-600 mt-1">Starting bid - final price determined by accepted bid</p>
              )}
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(4)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={onSubmit}
                className="bg-orange-500 hover:bg-orange-600"
                disabled={loading}
              >
                {loading ? 'Posting...' : 'Post Load'} <Check className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
