import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Get company ID
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Create recurring load template
    const { data: template, error: templateError } = await supabase
      .from('recurring_load_templates')
      .insert({
        company_id: company.id,
        ...body,
      })
      .select()
      .single()

    if (templateError) throw templateError

    // Generate initial instances if auto_post is enabled
    if (body.auto_post) {
      await generateRecurringInstances(supabase, template.id, body)
    }

    return NextResponse.json({ success: true, template })
  } catch (error) {
    console.error('Create recurring load error:', error)
    return NextResponse.json(
      { error: 'Failed to create recurring load' },
      { status: 500 }
    )
  }
}

async function generateRecurringInstances(
  supabase: any,
  templateId: string,
  template: any
) {
  const instances = []
  const today = new Date()
  const nextMonth = new Date(today)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  let currentDate = new Date(today)

  while (currentDate <= nextMonth) {
    let shouldGenerate = false

    switch (template.recurrence_pattern) {
      case 'daily':
        shouldGenerate = true
        break
      case 'weekly':
        if (template.recurrence_days?.includes(currentDate.getDay())) {
          shouldGenerate = true
        }
        break
      case 'biweekly':
        const weekOfYear = getWeekOfYear(currentDate)
        if (
          weekOfYear % 2 === 0 &&
          template.recurrence_days?.includes(currentDate.getDay())
        ) {
          shouldGenerate = true
        }
        break
      case 'monthly':
        if (template.recurrence_days?.includes(currentDate.getDate())) {
          shouldGenerate = true
        }
        break
    }

    if (shouldGenerate) {
      instances.push({
        template_id: templateId,
        scheduled_date: currentDate.toISOString().split('T')[0],
        posted: false,
      })
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  if (instances.length > 0) {
    await supabase.from('recurring_load_instances').insert(instances)
  }
}

function getWeekOfYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
