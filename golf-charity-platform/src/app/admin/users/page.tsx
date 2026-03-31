import { createClient } from '@/lib/supabase/server'
import { formatDrawMonth } from '@/lib/utils'
import { Search } from 'lucide-react'

export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createClient()
  const query = searchParams.q || ''

  let userQuery = supabase
    .from('profiles')
    .select('*, subscriptions(status, plan, renewal_date, charity_id)')
    .order('created_at', { ascending: false })

  if (query) {
    userQuery = userQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
  }

  const { data: users } = await userQuery.limit(50)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Users</h1>
          <p className="text-white/40 mt-1">{users?.length || 0} members found</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
        <form>
          <input
            name="q"
            defaultValue={query}
            className="input pl-10"
            placeholder="Search by name or email..."
          />
        </form>
      </div>

      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Renewal</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user: any) => {
                const sub = user.subscriptions?.[0]
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-500/20 flex items-center justify-center text-brand-400 text-sm font-bold flex-shrink-0">
                          {user.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-white/85 text-sm font-medium">{user.full_name || 'Unknown'}</p>
                          <p className="text-white/25 text-xs">{user.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-white/45 text-sm">{user.email}</td>
                    <td>
                      {sub?.plan
                        ? <span className="text-white/60 capitalize text-sm">{sub.plan}</span>
                        : <span className="text-white/20 text-sm">None</span>}
                    </td>
                    <td>
                      <span className={`badge ${sub?.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                        {sub?.status || 'none'}
                      </span>
                    </td>
                    <td className="text-white/35 text-xs">
                      {sub?.renewal_date
                        ? new Date(sub.renewal_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="text-white/35 text-xs">
                      {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!users?.length && (
            <div className="text-center py-12">
              <p className="text-white/30">No users found{query ? ` for "${query}"` : ''}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
