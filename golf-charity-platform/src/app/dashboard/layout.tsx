import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, charity:charities(*)')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-surface-900 flex">
      <DashboardNav profile={profile} subscription={subscription} />
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
