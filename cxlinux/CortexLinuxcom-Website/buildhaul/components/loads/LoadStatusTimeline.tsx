'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Circle, Clock } from 'lucide-react'

interface LoadStatusTimelineProps {
  status: string
  assignment: any
}

export function LoadStatusTimeline({ status, assignment }: LoadStatusTimelineProps) {
  const steps = [
    { key: 'posted', label: 'Posted', timestamp: assignment?.created_at },
    { key: 'assigned', label: 'Assigned', timestamp: assignment?.assigned_at },
    { key: 'en_route_pickup', label: 'En Route to Pickup', timestamp: assignment?.pickup_arrived_at },
    { key: 'at_pickup', label: 'At Pickup', timestamp: assignment?.pickup_arrived_at },
    { key: 'loaded', label: 'Loaded', timestamp: assignment?.loaded_at },
    { key: 'en_route_delivery', label: 'En Route to Delivery', timestamp: assignment?.delivery_arrived_at },
    { key: 'at_delivery', label: 'At Delivery', timestamp: assignment?.delivery_arrived_at },
    { key: 'completed', label: 'Completed', timestamp: assignment?.completed_at },
  ]

  const statusOrder = ['posted', 'assigned', 'in_progress', 'completed', 'cancelled']
  const assignmentStatusOrder = [
    'pending',
    'accepted',
    'en_route_pickup',
    'at_pickup',
    'loaded',
    'en_route_delivery',
    'at_delivery',
    'completed',
  ]

  const currentIndex = assignment
    ? assignmentStatusOrder.indexOf(assignment.status)
    : statusOrder.indexOf(status)

  const getStepStatus = (index: number) => {
    if (status === 'cancelled') return 'cancelled'
    if (assignment && index <= currentIndex) return 'completed'
    if (index === currentIndex + 1) return 'current'
    return 'pending'
  }

  return (
    <Card id="status-timeline-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Status Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const stepStatus = getStepStatus(index)

            return (
              <div key={step.key} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`rounded-full p-2 ${
                      stepStatus === 'completed'
                        ? 'bg-blue-900 text-white'
                        : stepStatus === 'current'
                        ? 'bg-blue-100 text-blue-900 border-2 border-blue-900'
                        : stepStatus === 'cancelled'
                        ? 'bg-red-100 text-red-900'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {stepStatus === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-0.5 h-12 ${
                        stepStatus === 'completed' ? 'bg-blue-900' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <p
                    className={`font-medium ${
                      stepStatus === 'completed' || stepStatus === 'current'
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.timestamp && (
                    <p className="text-sm text-gray-600">
                      {new Date(step.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
