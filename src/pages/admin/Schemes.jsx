import React, { useState } from 'react'
import { listSchemes, createScheme, updateScheme, deleteScheme, getCategories, verifyScheme, markSchemeVerification } from '../../services/api/schemes'
import { useToast } from '../../contexts/ToastContext'

const AdminSchemes = () => {
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'Active',
    category: '',
    region: '',
    eligibility: '',
    benefits: '',
    deadline: '',
    applicants: 0,
    objectives: [''],
    overview: '',
    documents: [''],
    faqs: [{ question: '', answer: '' }],
    source_url: '',
    summary: '',
  })

  React.useEffect(() => {
    // Prefetch categories when opening modal
    if (open && categories.length === 0) {
      getCategories().then(setCategories).catch(() => {})
    }
  }, [open, categories.length])

  // Fetch schemes
  const fetchSchemes = React.useCallback(async () => {
    try {
      const offset = (page - 1) * pageSize
      const res = await listSchemes({ q: query || undefined, limit: pageSize, offset })
      // listSchemes returns data array; total and offset are in response, but our helper returns only data.
      // Adjust: call client directly is avoided; so update listSchemes to also return meta in future. For now, we just set items.
      setItems(Array.isArray(res) ? res : [])
      // Best effort for total: if less than pageSize assume end
      setTotal((prev) => (Array.isArray(res) ? (res.length < pageSize && page > 1 ? (page - 1) * pageSize + res.length : Math.max(prev, page * pageSize)) : prev))
    } catch (e) {
      showToast('Failed to load schemes', 'error')
      console.error(e)
    }
  }, [page, pageSize, query, showToast])

  React.useEffect(() => {
    fetchSchemes()
  }, [fetchSchemes])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name === 'applicants' ? Number(value || 0) : value }))
  }

  const updateArrayField = (field, index, value) => {
    setForm((f) => {
      const arr = [...f[field]]
      arr[index] = value
      return { ...f, [field]: arr }
    })
  }

  const addArrayItem = (field, emptyValue) => {
    setForm((f) => ({ ...f, [field]: [...f[field], emptyValue] }))
  }

  const removeArrayItem = (field, index) => {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }))
  }

  const updateFaq = (index, key, value) => {
    setForm((f) => {
      const arr = [...f.faqs]
      arr[index] = { ...arr[index], [key]: value }
      return { ...f, faqs: arr }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        title: form.title?.trim(),
        description: form.description?.trim(),
        status: form.status,
        category: form.category,
        region: form.region?.trim(),
        eligibility: form.eligibility?.trim(),
        benefits: form.benefits?.trim(),
        deadline: form.deadline, // ISO or string accepted by backend
        applicants: Number(form.applicants) || 0,
        objectives: form.objectives.filter((s) => s && s.trim()).map((s) => s.trim()),
        overview: form.overview?.trim(),
        documents: form.documents.filter((s) => s && s.trim()).map((s) => s.trim()),
        faqs: form.faqs
          .filter((f) => (f.question && f.question.trim()) || (f.answer && f.answer.trim()))
          .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })),
        source_url: form.source_url?.trim(),
        summary: form.summary?.trim(),
      }

      if (editingId) {
        // Only send updatable fields supported by backend for PATCH
        const patchPayload = {
          title: payload.title,
          description: payload.description,
          summary: payload.summary,
          category: payload.category,
          region: payload.region,
          eligibility: payload.eligibility,
          benefits: payload.benefits,
          deadline: payload.deadline,
          status: payload.status,
          applicants: payload.applicants,
          source_url: payload.source_url,
        }
        await updateScheme(editingId, patchPayload)
        showToast('Scheme updated', 'success')
      } else {
        await createScheme(payload)
        showToast('Scheme created successfully', 'success')
      }
      setOpen(false)
      setEditingId(null)
      // Optional: reset form
      setForm({
        title: '', description: '', status: 'Active', category: '', region: '', eligibility: '', benefits: '', deadline: '', applicants: 0,
        objectives: [''], overview: '', documents: [''], faqs: [{ question: '', answer: '' }], source_url: '', summary: ''
      })
      fetchSchemes()
    } catch (err) {
      console.error(err)
      showToast(err?.message || 'Failed to create scheme', 'error')
    } finally {
      setLoading(false)
    }
  }

  const startCreate = () => {
    setEditingId(null)
    setForm({
      title: '', description: '', status: 'Active', category: '', region: '', eligibility: '', benefits: '', deadline: '', applicants: 0,
      objectives: [''], overview: '', documents: [''], faqs: [{ question: '', answer: '' }], source_url: '', summary: ''
    })
    setOpen(true)
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setForm((f) => ({
      ...f,
      title: item.title || '',
      description: item.description || '',
      status: item.status || 'Active',
      category: item.category || '',
      region: item.region || '',
      eligibility: item.eligibility || '',
      benefits: item.benefits || '',
      deadline: item.deadline || '',
      applicants: item.applicants || 0,
      source_url: item.source_url || '',
      summary: item.summary || '',
    }))
    setOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scheme?')) return
    try {
      await deleteScheme(id)
      showToast('Scheme deleted', 'success')
      fetchSchemes()
    } catch (e) {
      showToast('Failed to delete scheme', 'error')
      console.error(e)
    }
  }

  const handleVerify = async (id) => {
    try {
      const res = await verifyScheme(id)
      showToast(`Verification: ${res.label} (score ${res.risk_score})`, res.label === 'legit' ? 'success' : 'warning')
      fetchSchemes()
    } catch (e) {
      showToast('Failed to verify scheme', 'error')
      console.error(e)
    }
  }

  const handleMark = async (id, label) => {
    try {
      await markSchemeVerification(id, label)
      showToast(`Marked as ${label}`, 'info')
      fetchSchemes()
    } catch (e) {
      showToast('Failed to mark verification', 'error')
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Schemes</h1>
        <div className="flex gap-2">
          <input
            placeholder="Search schemes..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            className="rounded-lg border px-3 py-2"
          />
          <button onClick={fetchSchemes} className="px-3 py-2 rounded-lg border">Search</button>
          <button onClick={startCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          New Scheme
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        {items.length === 0 ? (
          <div className="text-gray-500">No schemes found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Deadline</th>
                  <th className="px-3 py-2">Applicants</th>
                  <th className="px-3 py-2">Verification</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="px-3 py-2 font-medium text-gray-900">{it.title}</td>
                    <td className="px-3 py-2">{it.category}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">{it.status}</span>
                    </td>
                    <td className="px-3 py-2">{it.deadline || '-'}</td>
                    <td className="px-3 py-2">{it.applicants ?? 0}</td>
                    <td className="px-3 py-2">
                      {it.verification?.manual_label ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{it.verification.manual_label}</span>
                      ) : it.verification?.label ? (
                        <span className={`px-2 py-1 text-xs rounded-full ${it.verification.label==='legit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {it.verification.label} ({it.verification.risk_score ?? 0})
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Not verified</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(it)} className="px-2 py-1 rounded border">Edit</button>
                        <button onClick={() => handleDelete(it.id)} className="px-2 py-1 rounded border text-red-600">Delete</button>
                        <button onClick={() => handleVerify(it.id)} className="px-2 py-1 rounded border text-purple-700">Verify</button>
                        <div className="relative inline-block">
                          <details>
                            <summary className="px-2 py-1 rounded border cursor-pointer text-gray-700 list-none">Mark</summary>
                            <div className="absolute z-10 mt-1 w-28 rounded border bg-white shadow">
                              <button onClick={() => handleMark(it.id, 'legit')} className="block w-full px-3 py-1 text-left hover:bg-gray-50">Legit</button>
                              <button onClick={() => handleMark(it.id, 'suspicious')} className="block w-full px-3 py-1 text-left hover:bg-gray-50">Suspicious</button>
                              <button onClick={() => handleMark(it.id, 'scam')} className="block w-full px-3 py-1 text-left hover:bg-gray-50">Scam</button>
                            </div>
                          </details>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">Page {page}</div>
              <div className="flex gap-2">
                <button disabled={page===1} onClick={() => setPage((p)=>Math.max(1,p-1))} className="px-3 py-1 rounded border disabled:opacity-50">Prev</button>
                <button disabled={items.length < pageSize} onClick={() => setPage((p)=>p+1)} className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-semibold">Add New Scheme</h2>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">×</button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input name="title" value={form.title} onChange={onChange} required className="mt-1 w-full rounded-lg border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select name="status" value={form.status} onChange={onChange} className="mt-1 w-full rounded-lg border px-3 py-2">
                    <option>Active</option>
                    <option>Upcoming</option>
                    <option>Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select name="category" value={form.category} onChange={onChange} className="mt-1 w-full rounded-lg border px-3 py-2">
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Region</label>
                  <input name="region" value={form.region} onChange={onChange} className="mt-1 w-full rounded-lg border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deadline</label>
                  <input type="date" name="deadline" value={form.deadline} onChange={onChange} className="mt-1 w-full rounded-lg border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Applicants</label>
                  <input type="number" min="0" name="applicants" value={form.applicants} onChange={onChange} className="mt-1 w-full rounded-lg border px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Source URL</label>
                  <input name="source_url" value={form.source_url} onChange={onChange} placeholder="https://..." className="mt-1 w-full rounded-lg border px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Summary</label>
                  <input name="summary" value={form.summary} onChange={onChange} className="mt-1 w-full rounded-lg border px-3 py-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" value={form.description} onChange={onChange} rows={3} className="mt-1 w-full rounded-lg border px-3 py-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Eligibility</label>
                  <textarea name="eligibility" value={form.eligibility} onChange={onChange} rows={3} className="mt-1 w-full rounded-lg border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Benefits</label>
                  <textarea name="benefits" value={form.benefits} onChange={onChange} rows={3} className="mt-1 w-full rounded-lg border px-3 py-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Overview</label>
                <textarea name="overview" value={form.overview} onChange={onChange} rows={3} className="mt-1 w-full rounded-lg border px-3 py-2" />
              </div>

              {/* Objectives */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Objectives</label>
                  <button type="button" onClick={() => addArrayItem('objectives', '')} className="text-sm text-blue-600">+ Add</button>
                </div>
                {form.objectives.map((obj, idx) => (
                  <div key={idx} className="mt-2 flex gap-2">
                    <input value={obj} onChange={(e) => updateArrayField('objectives', idx, e.target.value)} className="flex-1 rounded-lg border px-3 py-2" />
                    {form.objectives.length > 1 && (
                      <button type="button" onClick={() => removeArrayItem('objectives', idx)} className="px-2 text-red-600">Remove</button>
                    )}
                  </div>
                ))}
              </div>

              {/* Documents */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Documents</label>
                  <button type="button" onClick={() => addArrayItem('documents', '')} className="text-sm text-blue-600">+ Add</button>
                </div>
                {form.documents.map((doc, idx) => (
                  <div key={idx} className="mt-2 flex gap-2">
                    <input value={doc} onChange={(e) => updateArrayField('documents', idx, e.target.value)} className="flex-1 rounded-lg border px-3 py-2" />
                    {form.documents.length > 1 && (
                      <button type="button" onClick={() => removeArrayItem('documents', idx)} className="px-2 text-red-600">Remove</button>
                    )}
                  </div>
                ))}
              </div>

              {/* FAQs */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">FAQs</label>
                  <button type="button" onClick={() => addArrayItem('faqs', { question: '', answer: '' })} className="text-sm text-blue-600">+ Add</button>
                </div>
                {form.faqs.map((faq, idx) => (
                  <div key={idx} className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input placeholder="Question" value={faq.question} onChange={(e) => updateFaq(idx, 'question', e.target.value)} className="rounded-lg border px-3 py-2" />
                    <input placeholder="Answer" value={faq.answer} onChange={(e) => updateFaq(idx, 'answer', e.target.value)} className="rounded-lg border px-3 py-2" />
                    {form.faqs.length > 1 && (
                      <div className="md:col-span-2">
                        <button type="button" onClick={() => removeArrayItem('faqs', idx)} className="text-sm text-red-600">Remove FAQ</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 border-t pt-4">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-60">
                  {loading ? 'Saving...' : 'Create Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSchemes
