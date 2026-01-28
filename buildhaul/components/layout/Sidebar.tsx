'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Truck, Package, Building2, DollarSign, User, History, Bell, Settings, MapPin, TruckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

const posterNavItems = [
  { href: '/loads', label: 'My Loads', icon: Package },
  { href: '/loads/new', label: 'Post New Load', icon: Package },
  { href: '/drivers', label: 'Browse Drivers', icon: User },
  { href: '/history', label: 'History', icon: History },
  { href: '/payments', label: 'Payments', icon: DollarSign },
  { href: '/company', label: 'Company', icon: Building2 },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const driverNavItems = [
  { href: '/available', label: 'Available Loads', icon: MapPin },
  { href: '/my-loads', label: 'My Loads', icon: Package },
  { href: '/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/trucks', label: 'My Trucks', icon: TruckIcon },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const navItems = profile?.role === 'poster' ? posterNavItems : driverNavItems

  return (
    <aside id="sidebar" className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r hidden md:block">
      <nav id="sidebar-nav" className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-900 text-white'
                  : 'text-gray-700 hover:bg-slate-100'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
