import React, { useEffect, useMemo, useState } from 'react'
import { Plus, FileDown, Download, BarChart3, Wallet, Calendar, Search, Filter, Trash2, Edit } from 'lucide-react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const categories = ['administration','academics','finance','social','community service','documentation']

function Section({ title, children, actions }){
  return (
    <div className="bg-white/80 backdrop-blur shadow rounded-xl p-6 border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-blue-800">{title}</h2>
        <div className="flex gap-2">{actions}</div>
      </div>
      {children}
    </div>
  )
}

function Input({ label, ...props }){
  return (
    <label className="flex flex-col gap-1 text-sm text-blue-900">
      <span className="font-medium">{label}</span>
      <input className="px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400" {...props} />
    </label>
  )
}

function Select({ label, options, ...props }){
  return (
    <label className="flex flex-col gap-1 text-sm text-blue-900">
      <span className="font-medium">{label}</span>
      <select className="px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400" {...props}>
        <option value="">Select...</option>
        {options.map(o=> <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}

function Textarea({ label, ...props }){
  return (
    <label className="flex flex-col gap-1 text-sm text-blue-900">
      <span className="font-medium">{label}</span>
      <textarea className="px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400" rows={3} {...props} />
    </label>
  )
}

function BlueButton({ children, ...props }){
  return <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2" {...props}>{children}</button>
}

function OutlineButton({ children, ...props }){
  return <button className="px-4 py-2 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 font-medium flex items-center gap-2" {...props}>{children}</button>
}

function useMonthYear(){
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth()+1)
  const [year, setYear] = useState(now.getFullYear())
  return {month, setMonth, year, setYear}
}

function ActivityForm({editing, onSaved}){
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), name: '', category: '', duration_hours: 0, output: '', notes: '', files: [] })
  const [uploading, setUploading] = useState(false)

  useEffect(()=>{
    if(editing){
      setForm({
        date: editing.date?.slice(0,10) || new Date().toISOString().slice(0,10),
        name: editing.name || '',
        category: editing.category || '',
        duration_hours: editing.duration_hours || 0,
        output: editing.output || '',
        notes: editing.notes || '',
        file_ids: editing.file_ids || []
      })
    }
  },[editing])

  const handleFile = async (e)=>{
    const file = e.target.files?.[0]
    if(!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await axios.post(`${API_BASE}/files`, fd)
    setUploading(false)
    setForm(prev=>({...prev, file_ids: [...(prev.file_ids||[]), res.data.id]}))
  }

  const submit = async (e)=>{
    e.preventDefault()
    const payload = { ...form, duration_hours: parseFloat(form.duration_hours||0) }
    if(editing?.id){
      await axios.put(`${API_BASE}/activities/${editing.id}`, payload)
    } else {
      await axios.post(`${API_BASE}/activities`, payload)
    }
    onSaved?.()
    setForm({ date: new Date().toISOString().slice(0,10), name: '', category: '', duration_hours: 0, output: '', notes: '', file_ids: [] })
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Input label="Date" type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} />
      <Input label="Activity Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
      <Select label="Category" options={categories} value={form.category} onChange={e=>setForm({...form, category: e.target.value})} />
      <Input label="Duration (hours)" type="number" step="0.1" value={form.duration_hours} onChange={e=>setForm({...form, duration_hours: e.target.value})} />
      <Input label="Upload Evidence" type="file" onChange={handleFile} />
      <div className="flex items-end">{uploading ? <span className="text-blue-600">Uploading...</span> : <span className="text-sm text-blue-700">{(form.file_ids||[]).length} files added</span>}</div>
      <Textarea label="Output / Result" value={form.output} onChange={e=>setForm({...form, output: e.target.value})} />
      <Textarea label="Notes" value={form.notes} onChange={e=>setForm({...form, notes: e.target.value})} />
      <div className="md:col-span-3 flex gap-3">
        <BlueButton type="submit"><Plus size={18}/> {editing? 'Update Activity':'Add Activity'}</BlueButton>
      </div>
    </form>
  )
}

function FinanceForm({onSaved, editing}){
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), category: '', income: 0, expense: 0, notes: '' })
  useEffect(()=>{ if(editing){ setForm({ date: editing.date?.slice(0,10), category: editing.category, income: editing.income, expense: editing.expense, notes: editing.notes||'' }) } },[editing])
  const submit = async (e)=>{
    e.preventDefault()
    const payload = { ...form, income: parseFloat(form.income||0), expense: parseFloat(form.expense||0) }
    if(editing?.id){ await axios.put(`${API_BASE}/finances/${editing.id}`, payload) } else { await axios.post(`${API_BASE}/finances`, payload) }
    onSaved?.()
    setForm({ date: new Date().toISOString().slice(0,10), category: '', income: 0, expense: 0, notes: '' })
  }
  const total = (parseFloat(form.income||0) - parseFloat(form.expense||0)).toFixed(2)
  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Input label="Date" type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} />
      <Input label="Category" value={form.category} onChange={e=>setForm({...form, category: e.target.value})} />
      <Input label="Income" type="number" step="0.01" value={form.income} onChange={e=>setForm({...form, income: e.target.value})} />
      <Input label="Expense" type="number" step="0.01" value={form.expense} onChange={e=>setForm({...form, expense: e.target.value})} />
      <Textarea label="Notes" className="md:col-span-3" value={form.notes} onChange={e=>setForm({...form, notes: e.target.value})} />
      <div className="md:col-span-4 flex items-center gap-3">
        <div className="text-blue-800 font-semibold">Net Total: {total}</div>
        <BlueButton type="submit"><Wallet size={18}/> {editing? 'Update Finance':'Add Finance'}</BlueButton>
      </div>
    </form>
  )
}

function DataTable({ columns, data, onEdit, onDelete, search, setSearch }){
  const filtered = useMemo(()=>{
    if(!search) return data
    return data.filter(row=> Object.values(row).some(v=> String(v||'').toLowerCase().includes(search.toLowerCase())))
  },[data, search])
  return (
    <div className="overflow-x-auto">
      <div className="flex items-center gap-2 mb-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 text-blue-500" size={16}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-7 pr-3 py-2 rounded-lg border border-blue-200" />
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-blue-700">
            {columns.map(col=> <th key={col.key} className="py-2 border-b border-blue-100">{col.label}</th>)}
            <th className="py-2 border-b border-blue-100">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(row=> (
            <tr key={row.id} className="hover:bg-blue-50">
              {columns.map(col=> <td key={col.key} className="py-2 border-b border-blue-50 pr-4">{col.render? col.render(row[col.key], row) : String(row[col.key]||'')}</td>)}
              <td className="py-2 border-b border-blue-50">
                <div className="flex gap-2">
                  <OutlineButton onClick={()=>onEdit(row)}><Edit size={16}/> Edit</OutlineButton>
                  <OutlineButton onClick={()=>onDelete(row)}><Trash2 size={16}/> Delete</OutlineButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Cards({ stats }){
  const Item = ({icon:Icon, title, value}) => (
    <div className="flex items-center gap-3 bg-blue-600 text-white rounded-xl p-4 shadow">
      <Icon size={28}/>
      <div>
        <div className="text-sm opacity-80">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  )
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Item icon={Calendar} title="This Month Activities" value={stats.totalActivities}/>
      <Item icon={Wallet} title="Income" value={stats.income.toFixed(2)}/>
      <Item icon={Wallet} title="Expense" value={stats.expense.toFixed(2)}/>
      <Item icon={BarChart3} title="Net" value={(stats.income-stats.expense).toFixed(2)}/>
    </div>
  )
}

function SimpleBar({ data }){
  const max = Math.max(1, ...data.map(d=>d.value))
  return (
    <div className="space-y-2">
      {data.map(d=> (
        <div key={d.label} className="">
          <div className="flex justify-between text-sm text-blue-800"><span>{d.label}</span><span>{d.value}</span></div>
          <div className="h-2 bg-blue-100 rounded">
            <div className="h-2 bg-blue-600 rounded" style={{width: `${(d.value/max)*100}%`}}></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function App(){
  const {month, setMonth, year, setYear} = useMonthYear()
  const [activities, setActivities] = useState([])
  const [finances, setFinances] = useState([])
  const [editingActivity, setEditingActivity] = useState(null)
  const [editingFinance, setEditingFinance] = useState(null)
  const [searchA, setSearchA] = useState('')
  const [searchF, setSearchF] = useState('')

  const fetchAll = async ()=>{
    const [a, f, recap] = await Promise.all([
      axios.get(`${API_BASE}/activities`, { params: { month, year } }),
      axios.get(`${API_BASE}/finances`, { params: { month, year } }),
      axios.get(`${API_BASE}/recap`, { params: { month, year } }),
    ])
    setActivities(a.data)
    setFinances(f.data)
    setDashboard({
      totalActivities: recap.data.total_activities,
      income: recap.data.total_income,
      expense: recap.data.total_expense,
      byCategory: recap.data.activities_by_category,
      summary: recap.data.summary,
    })
  }

  const [dashboard, setDashboard] = useState({ totalActivities: 0, income: 0, expense: 0, byCategory: {}, summary: '' })

  useEffect(()=>{ fetchAll() }, [month, year])

  const removeActivity = async (row)=>{ await axios.delete(`${API_BASE}/activities/${row.id}`); fetchAll(); }
  const removeFinance = async (row)=>{ await axios.delete(`${API_BASE}/finances/${row.id}`); fetchAll(); }

  const columnsA = [
    { key: 'date', label: 'Date' },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'duration_hours', label: 'Duration (h)' },
    { key: 'output', label: 'Output' },
  ]
  const columnsF = [
    { key: 'date', label: 'Date' },
    { key: 'category', label: 'Category' },
    { key: 'income', label: 'Income' },
    { key: 'expense', label: 'Expense' },
  ]

  const download = async (type)=>{
    const url = `${API_BASE}/export/${type}?month=${month}&year=${year}`
    const res = await fetch(url)
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `report_${year}_${String(month).padStart(2,'0')}.${type==='pdf'?'pdf':'xlsx'}`
    a.click()
  }

  const monthOptions = Array.from({length:12}, (_,i)=>i+1)
  const yearOptions = Array.from({length:5}, (_,i)=> new Date().getFullYear()-2 + i)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-blue-900">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-800">Monthly Report</h1>
          <div className="flex gap-2">
            <select className="px-3 py-2 rounded-lg border border-blue-200" value={month} onChange={e=>setMonth(parseInt(e.target.value))}>
              {monthOptions.map(m=> <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="px-3 py-2 rounded-lg border border-blue-200" value={year} onChange={e=>setYear(parseInt(e.target.value))}>
              {yearOptions.map(y=> <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </header>

        <Cards stats={dashboard} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="Daily Activity" actions={<></>}>
            <ActivityForm editing={editingActivity} onSaved={()=>{ setEditingActivity(null); fetchAll() }} />
          </Section>
          <Section title="Finance (Optional)" actions={<></>}>
            <FinanceForm editing={editingFinance} onSaved={()=>{ setEditingFinance(null); fetchAll() }} />
          </Section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="Activities" actions={
            <div className="flex gap-2">
              <OutlineButton onClick={()=>download('pdf')}><FileDown size={18}/> PDF</OutlineButton>
              <OutlineButton onClick={()=>download('excel')}><Download size={18}/> Excel</OutlineButton>
            </div>
          }>
            <DataTable columns={columnsA} data={activities} search={searchA} setSearch={setSearchA} onEdit={setEditingActivity} onDelete={removeActivity} />
            <div className="mt-4">
              <h3 className="font-semibold text-blue-800 mb-2">Activity by Category</h3>
              <SimpleBar data={Object.entries(dashboard.byCategory).map(([k,v])=>({label:k,value:v}))} />
            </div>
          </Section>
          <Section title="Finance" actions={
            <div className="flex gap-2">
              <OutlineButton onClick={()=>download('pdf')}><FileDown size={18}/> PDF</OutlineButton>
              <OutlineButton onClick={()=>download('excel')}><Download size={18}/> Excel</OutlineButton>
            </div>
          }>
            <DataTable columns={columnsF} data={finances} search={searchF} setSearch={setSearchF} onEdit={setEditingFinance} onDelete={removeFinance} />
            <div className="mt-4">
              <h3 className="font-semibold text-blue-800 mb-2">Finance Overview</h3>
              <SimpleBar data={[{label:'Income', value:dashboard.income},{label:'Expense', value:dashboard.expense},{label:'Net', value:dashboard.income-dashboard.expense}]} />
            </div>
          </Section>
        </div>

        <Section title="Monthly Recap" actions={<></>}>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="text-sm whitespace-pre-wrap p-4 bg-blue-50 rounded-lg border border-blue-100">{dashboard.summary}</div>
            </div>
            <div className="space-y-2">
              <BlueButton onClick={()=>download('pdf')}><FileDown size={18}/> Download PDF</BlueButton>
              <OutlineButton onClick={()=>download('excel')}><Download size={18}/> Download Excel</OutlineButton>
            </div>
          </div>
        </Section>

        <footer className="text-center text-sm text-blue-500">Built for quick monthly reporting. Blue theme, clean UI.</footer>
      </div>
    </div>
  )
}
