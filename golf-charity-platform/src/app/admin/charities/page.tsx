'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Plus, Edit2, ToggleLeft, ToggleRight, Loader2, CheckCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPounds } from '@/lib/utils'
import type { Charity } from '@/types'
import toast from 'react-hot-toast'

export default function AdminCharitiesPage() {
  const supabase = createClient()
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Charity | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ name: '', description: '', category: '', website: '', logo_url: '' })

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('charities').select('*').order('total_raised', { ascending: false })
    setCharities(data || [])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm({ name: '', description: '', category: '', website: '', logo_url: '' })
    setShowForm(true)
  }

  function openEdit(c: Charity) {
    setEditing(c)
    setForm({ name: c.name, description: c.description || '', category: c.category || '', website: c.website || '', logo_url: c.logo_url || '' })
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)

    const payload = { ...form }
    const { error } = editing
      ? await supabase.from('charities').update(payload).eq('id', editing.id)
      : await supabase.from('charities').insert({ ...payload, is_active: true, total_raised: 0, donor_count: 0 })

    if (error) toast.error('Failed to save')
    else { toast.success(editing ? 'Charity updated' : 'Charity created'); load(); setShowForm(false) }
    setSaving(false)
  }

  async function toggleActive(c: Charity) {
    const { error } = await supabase.from('charities').update({ is_active: !c.is_active }).eq('id', c.id)
    if (error) toast.error('Failed to update')
    else { toast.success(c.is_active ? 'Charity hidden' : 'Charity activated'); load() }
  }

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 size={28} className="text-brand-400 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Charities</h1>
          <p className="text-white/40 mt-1">Manage listed charities and their details.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary"><Plus size={15} /> Add charity</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {charities.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`card transition-all ${!c.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Heart size={18} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{c.name}</h3>
                  {c.category && (
                    <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">{c.category}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(c)} className="btn btn-ghost text-xs p-2"><Edit2 size={13} /></button>
                <button onClick={() => toggleActive(c)}
                  className={`transition-colors ${c.is_active ? 'text-brand-400 hover:text-white/40' : 'text-white/25 hover:text-brand-400'}`}>
                  {c.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
              </div>
            </div>

            {c.description && (
              <p className="text-white/40 text-xs leading-relaxed mb-4 line-clamp-2">{c.description}</p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-white/3">
                <p className="text-brand-400 font-bold text-sm">{formatPounds(c.total_raised)}</p>
                <p className="text-white/25 text-xs">Raised</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/3">
                <p className="text-white/70 font-bold text-sm">{c.donor_count}</p>
                <p className="text-white/25 text-xs">Contributors</p>
              </div>
            </div>

            {!c.is_active && (
              <div className="mt-3 text-center">
                <span className="badge badge-inactive text-xs">Hidden from subscribers</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="card w-full max-w-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-white">
                  {editing ? 'Edit charity' : 'Add charity'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Charity name *</label>
                  <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Cancer Research UK" required />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Category</label>
                  <input className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Health, Humanitarian, etc." />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Description</label>
                  <textarea className="input resize-none" rows={3} value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description of the charity..." />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Website URL</label>
                  <input className="input" type="url" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Logo URL</label>
                  <input className="input" type="url" value={form.logo_url} onChange={e => setForm(p => ({ ...p, logo_url: e.target.value }))} placeholder="https://..." />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                    {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><CheckCircle size={14} /> {editing ? 'Update' : 'Create'} charity</>}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
