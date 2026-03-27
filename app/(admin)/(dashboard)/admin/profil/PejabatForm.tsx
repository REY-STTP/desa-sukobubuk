'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Users, Plus, Trash2, Loader2, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, Camera, UserCircle2, Save, GripVertical,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Pejabat = {
  id?: number | string
  nama: string
  jabatan: string
  kategori: string
  urutan: number
  foto_url?: string | null
  _fotoFile?: File | null
  _fotoPreview?: string | null
  _uploading?: boolean
}

interface Props {
  initialData: Pejabat[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const KATEGORI_OPTIONS = [
  { value: 'kepala',     label: 'Kepala Desa' },
  { value: 'sekretaris', label: 'Sekretaris' },
  { value: 'kasi',       label: 'Kasi' },
  { value: 'kaur',       label: 'Kaur' },
  { value: 'kadus',      label: 'Kadus' },
]

const newPejabat = (kategori = 'kepala', urutan = 0): Pejabat => ({
  id: `new-${Date.now()}-${Math.random()}`,
  nama: '',
  jabatan: '',
  kategori,
  urutan,
  foto_url: null,
  _fotoFile: null,
  _fotoPreview: null,
})

// ─── Komponen Utama ──────────────────────────────────────────────────────────

export default function PejabatForm({ initialData }: Props) {
  const router = useRouter()
  const [list, setList] = useState<Pejabat[]>(
    initialData.length > 0 ? initialData : [newPejabat()]
  )
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const update = (idx: number, patch: Partial<Pejabat>) =>
    setList(prev => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)))

  const addRow = () =>
    setList(prev => [
      ...prev,
      newPejabat(prev[prev.length - 1]?.kategori ?? 'Kepala Desa & Wakil', prev.length),
    ])

  const removeRow = (idx: number) =>
    setList(prev => prev.filter((_, i) => i !== idx))

  const moveRow = (idx: number, dir: -1 | 1) => {
    const next = [...list]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setList(next)
  }

  const handleFotoChange = (idx: number, file: File) => {
    const preview = URL.createObjectURL(file)
    update(idx, { _fotoFile: file, _fotoPreview: preview })
  }

  const uploadFotoSingle = async (pejabat: Pejabat): Promise<string | null> => {
    if (!pejabat._fotoFile) return pejabat.foto_url ?? null
    const fd = new FormData()
    fd.append('foto', pejabat._fotoFile)
    const res = await fetch('/api/admin/profil/pejabat/foto', { method: 'POST', body: fd })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      throw new Error(d.error || 'Gagal upload foto ' + pejabat.nama)
    }
    const data = await res.json()
    return data.foto_url as string
  }

  const handleSave = async () => {
    for (const p of list) {
      if (!p.nama.trim() || !p.jabatan.trim()) {
        setAlert({ type: 'error', msg: 'Nama dan jabatan wajib diisi untuk semua entri.' })
        return
      }
    }

    setSaving(true)
    setAlert(null)

    try {
      const withFotoUrls = await Promise.all(
        list.map(async (p, i) => {
          if (p._fotoFile) {
            update(i, { _uploading: true })
            const url = await uploadFotoSingle(p)
            update(i, { _uploading: false, foto_url: url ?? undefined, _fotoFile: null })
            return { ...p, foto_url: url }
          }
          return p
        })
      )

      const payload = withFotoUrls.map((p, i) => ({
        id: typeof p.id === 'string' && p.id.startsWith('new-') ? undefined : p.id,
        nama: p.nama.trim(),
        jabatan: p.jabatan.trim(),
        kategori: p.kategori,
        urutan: i,
        foto_url: p.foto_url ?? null,
      }))

      const res = await fetch('/api/admin/profil/pejabat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pejabat: payload }),
      })

      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Gagal menyimpan data pejabat')
      }

      setAlert({ type: 'success', msg: 'Struktur organisasi berhasil disimpan!' })
      router.refresh()
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.message })
    }

    setSaving(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-gray-900">Struktur Organisasi</h2>
          <span className="text-xs text-gray-400 ml-1">Pejabat &amp; perangkat desa</span>
        </div>
        <button
          onClick={addRow}
          disabled={saving}
          className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>

      {/* Alert */}
      {alert && (
        <div
          className={`flex items-center gap-2.5 rounded-xl p-3.5 text-sm mb-4 ${
            alert.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {alert.msg}
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {list.map((p, idx) => (
          <PejabatRow
            key={String(p.id ?? idx)}
            pejabat={p}
            idx={idx}
            total={list.length}
            saving={saving}
            onChange={(patch) => update(idx, patch)}
            onFotoChange={(file) => handleFotoChange(idx, file)}
            onRemove={() => removeRow(idx)}
            onMove={(dir) => moveRow(idx, dir)}
          />
        ))}

        {list.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            Belum ada pejabat.{' '}
            <button onClick={addRow} className="text-primary-600 underline">
              Tambah sekarang
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={saving || list.length === 0}
          className="btn-primary gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
          ) : (
            <><Save className="w-4 h-4" /> Simpan Struktur</>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Sub-komponen: Satu Baris Pejabat ────────────────────────────────────────

interface RowProps {
  pejabat: Pejabat
  idx: number
  total: number
  saving: boolean
  onChange: (patch: Partial<Pejabat>) => void
  onFotoChange: (file: File) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}

function PejabatRow({ pejabat, idx, total, saving, onChange, onFotoChange, onRemove, onMove }: RowProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const preview = pejabat._fotoPreview ?? pejabat.foto_url ?? null

  return (
    <div className="flex gap-3 items-start p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
      {/* Urutan naik/turun */}
      <div className="flex flex-col items-center gap-0.5 pt-1 flex-shrink-0">
        <button
          onClick={() => onMove(-1)}
          disabled={idx === 0 || saving}
          className="text-gray-300 hover:text-gray-500 disabled:opacity-20 disabled:cursor-not-allowed"
          title="Naikkan"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <GripVertical className="w-4 h-4 text-gray-200" />
        <button
          onClick={() => onMove(1)}
          disabled={idx === total - 1 || saving}
          className="text-gray-300 hover:text-gray-500 disabled:opacity-20 disabled:cursor-not-allowed"
          title="Turunkan"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Foto */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        <div
          onClick={() => !saving && inputRef.current?.click()}
          className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 hover:border-primary-400 cursor-pointer group transition-colors flex items-center justify-center"
          title="Klik untuk pilih foto"
        >
          {pejabat._uploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
          ) : preview ? (
            <>
              <Image
                src={preview}
                alt={pejabat.nama || 'Foto pejabat'}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-0.5 text-gray-300 group-hover:text-primary-400 transition-colors">
              <UserCircle2 className="w-7 h-7" />
              <Camera className="w-3 h-3" />
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => e.target.files?.[0] && onFotoChange(e.target.files[0])}
        />
        <p className="text-[10px] text-gray-400">Foto</p>
      </div>

      {/* Input fields */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5 min-w-0">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Nama</label>
          <input
            type="text"
            value={pejabat.nama}
            onChange={e => onChange({ nama: e.target.value })}
            placeholder="Budi Santoso"
            className="input-field text-sm"
            disabled={saving}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Jabatan</label>
          <input
            type="text"
            value={pejabat.jabatan}
            onChange={e => onChange({ jabatan: e.target.value })}
            placeholder="Kepala Desa"
            className="input-field text-sm"
            disabled={saving}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Kategori</label>
          <select
            value={pejabat.kategori}
            onChange={e => onChange({ kategori: e.target.value })}
            className="input-field text-sm"
            disabled={saving}
          >
            {KATEGORI_OPTIONS.map(k => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hapus */}
      <button
        onClick={onRemove}
        disabled={saving}
        className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-1"
        title="Hapus"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}