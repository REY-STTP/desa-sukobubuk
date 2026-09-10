'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Users, Plus, Trash2, Loader2, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, Camera, UserCircle2, Save, GripVertical,
  Crop,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// F2-Fase4 / T-40 — modal crop bersama (chunk terpisah, hanya diunduh
// saat dibuka): square 512×512 + pratinjau lingkaran, tanpa zoom.
const CropModal = dynamic(() => import('@/components/admin/CropModal').then((m) => m.CropModal), {
  ssr: false,
})

// ─── Types ────────────────────────────────────────────────────────────────────

type Pejabat = {
  id?: number | string
  nama: string
  jabatan: string
  kategori: string
  urutan: number
  foto_url?: string | null
  _fotoFile?: File | Blob | null
  _fotoPreview?: string | null
  _uploading?: boolean
}

interface Props { initialData: Pejabat[] }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KATEGORI_OPTIONS = [
  { value: 'kepala',     label: 'Kepala Desa' },
  { value: 'sekretaris', label: 'Sekretaris' },
  { value: 'kasi',       label: 'Kasi' },
  { value: 'kaur',       label: 'Kaur' },
  { value: 'kadus',      label: 'Kadus' },
]

const newPejabat = (kategori = 'kepala', urutan = 0): Pejabat => ({
  id: `new-${Date.now()}-${Math.random()}`,
  nama: '', jabatan: '', kategori, urutan,
  foto_url: null, _fotoFile: null, _fotoPreview: null,
})

// ─── Komponen Utama ───────────────────────────────────────────────────────────

export default function PejabatForm({ initialData }: Props) {
  const router  = useRouter()
  const [list,   setList]  = useState<Pejabat[]>(initialData.length > 0 ? initialData : [newPejabat()])
  const [saving, setSaving]= useState(false)
  const [alert,  setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // State untuk crop modal — hanya satu modal aktif pada satu waktu
  const [cropState, setCropState] = useState<{ src: string; idx: number } | null>(null)

  const update = (idx: number, patch: Partial<Pejabat>) =>
    setList(prev => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)))

  const addRow    = () => setList(prev => [...prev, newPejabat(prev[prev.length - 1]?.kategori ?? 'kepala', prev.length)])
  const removeRow = (idx: number) => setList(prev => prev.filter((_, i) => i !== idx))
  const moveRow   = (idx: number, dir: -1 | 1) => {
    const next = [...list]; const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setList(next)
  }

  // Saat file dipilih → validasi dini lalu buka modal crop.
  // P1-B3: samakan dengan server (pejabat/foto: 3MB, JPG/PNG/WEBP).
  const handleFotoSelect = (idx: number, file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAlert({ type: 'error', msg: 'Format foto harus JPG, PNG, atau WEBP' })
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setAlert({ type: 'error', msg: 'Ukuran foto maksimal 3MB' })
      return
    }
    setCropState({ src: URL.createObjectURL(file), idx })
  }

  // Setelah crop dikonfirmasi → simpan blob ke _fotoFile & preview
  const handleCropConfirm = (blob: Blob) => {
    if (!cropState) return
    if (cropState.src) URL.revokeObjectURL(cropState.src)
    const preview = URL.createObjectURL(blob)
    update(cropState.idx, { _fotoFile: blob, _fotoPreview: preview })
    setCropState(null)
  }

  const handleCropCancel = () => {
    if (cropState?.src) URL.revokeObjectURL(cropState.src)
    setCropState(null)
  }

  const uploadFotoSingle = async (pejabat: Pejabat): Promise<string | null> => {
    if (!pejabat._fotoFile) return pejabat.foto_url ?? null
    const fd = new FormData()
    fd.append('foto', pejabat._fotoFile, 'foto.webp')
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
    setSaving(true); setAlert(null)
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
        nama: p.nama.trim(), jabatan: p.jabatan.trim(),
        kategori: p.kategori, urutan: i, foto_url: p.foto_url ?? null,
      }))
      const res = await fetch('/api/admin/profil/pejabat', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pejabat: payload }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Gagal menyimpan') }
      setAlert({ type: 'success', msg: 'Struktur organisasi berhasil disimpan!' })
      router.refresh()
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.message })
    }
    setSaving(false)
  }

  return (
    <>
      {cropState && (
        <CropModal
          src={cropState.src}
          title="Crop Foto Pejabat"
          sizeLabel="512 × 512 px (1:1)"
          outputWidth={512}
          outputHeight={512}
          initialFill={0.85}
          overlay="circle-box"
          footerHint="Lingkaran = tampilan di web"
          footerBar
          resetLabel="Reset"
          confirmLabel="Terapkan"
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      <div className="surface-elevated p-5 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-sage-600" data-icon="inline-start" />
            <h2 className="font-display text-base font-medium text-stone-800">Struktur Organisasi</h2>
            <span className="hidden text-xs text-stone-400 sm:inline">Pejabat &amp; perangkat desa</span>
          </div>
          <Button variant="ghost" size="sm" onClick={addRow} disabled={saving}>
            <Plus className="size-4" data-icon="inline-start" />
            Tambah
          </Button>
        </div>

        {alert && (
          <div
            className={`flex items-center gap-2.5 rounded-xl p-3.5 text-sm ${alert.type === 'success' ? 'border border-sage-200 bg-sage-50 text-sage-800' : 'border border-ember-300 bg-ember-50 text-ember-800'}`}
          >
            {alert.type === 'success' ? (
              <CheckCircle className="size-4 shrink-0 text-sage-600" />
            ) : (
              <AlertCircle className="size-4 shrink-0 text-ember-600" />
            )}
            {alert.msg}
          </div>
        )}

        <div className="space-y-3">
          {list.map((p, idx) => (
            <PejabatRow
              key={String(p.id ?? idx)}
              pejabat={p} idx={idx} total={list.length} saving={saving}
              onChange={patch => update(idx, patch)}
              onFotoChange={file => handleFotoSelect(idx, file)}
              onRemove={() => removeRow(idx)}
              onMove={dir => moveRow(idx, dir)}
            />
          ))}
          {list.length === 0 && (
            <div className="py-10 text-center text-sm text-stone-500">
              Belum ada pejabat.{' '}
              <button onClick={addRow} className="text-sage-700 underline hover:text-sage-800">
                Tambah sekarang
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end border-t border-stone-200 pt-4">
          <Button onClick={handleSave} disabled={saving || list.length === 0}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            ) : (
              <Save className="size-4" data-icon="inline-start" />
            )}
            {saving ? 'Menyimpan...' : 'Simpan Struktur'}
          </Button>
        </div>
      </div>
    </>
  )
}

// ─── Sub-komponen: Satu Baris Pejabat ────────────────────────────────────────

interface RowProps {
  pejabat: Pejabat; idx: number; total: number; saving: boolean
  onChange: (patch: Partial<Pejabat>) => void
  onFotoChange: (file: File) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}

function PejabatRow({ pejabat, idx, total, saving, onChange, onFotoChange, onRemove, onMove }: RowProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const preview  = pejabat._fotoPreview ?? pejabat.foto_url ?? null

  return (
    <div className="flex gap-3 items-start p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors">
      {/* Urutan */}
      <div className="flex flex-col items-center gap-0.5 pt-1 flex-shrink-0">
        <button onClick={() => onMove(-1)} disabled={idx === 0 || saving} className="text-stone-400 hover:text-stone-500 disabled:opacity-20 disabled:cursor-not-allowed" title="Naikkan"><ChevronUp className="size-4" /></button>
        <GripVertical className="size-4 text-stone-300" />
        <button onClick={() => onMove(1)} disabled={idx === total - 1 || saving} className="text-stone-400 hover:text-stone-500 disabled:opacity-20 disabled:cursor-not-allowed" title="Turunkan"><ChevronDown className="size-4" /></button>
      </div>

      {/* Foto */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        <div
          onClick={() => !saving && inputRef.current?.click()}
          className="relative size-16 rounded-xl overflow-hidden bg-stone-100 border-2 border-dashed border-stone-200 hover:border-primary-400 cursor-pointer group transition-colors flex items-center justify-center"
          title="Klik untuk pilih & crop foto"
        >
          {pejabat._uploading ? (
            <Loader2 className="size-5 animate-spin text-primary-500" />
          ) : preview ? (
            <>
              <Image src={preview} alt={pejabat.nama || 'Foto pejabat'} fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                <Crop className="size-4 text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-0.5 text-stone-400 group-hover:text-primary-400 transition-colors">
              <UserCircle2 className="size-7" />
              <Camera className="size-3" />
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => e.target.files?.[0] && onFotoChange(e.target.files[0])} />
        <p className="text-[10px] text-stone-400">Foto</p>
      </div>

      {/* Fields */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5 min-w-0">
        <div>
          <label className="block text-xs font-semibold text-stone-500 mb-1">Nama</label>
          <Input type="text" value={pejabat.nama} onChange={e => onChange({ nama: e.target.value })} placeholder="Budi Santoso" className=" text-sm" disabled={saving}  />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 mb-1">Jabatan</label>
          <Input type="text" value={pejabat.jabatan} onChange={e => onChange({ jabatan: e.target.value })} placeholder="Kepala Desa" className=" text-sm" disabled={saving}  />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 mb-1">Kategori</label>
          <Select value={pejabat.kategori} onValueChange={(val) => onChange({ kategori: val })}  disabled={saving}>
  <SelectTrigger className="text-sm"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
  <SelectContent>
    {KATEGORI_OPTIONS.map(k => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}
  </SelectContent>
</Select>
        </div>
      </div>

      {/* Hapus */}
      <button onClick={onRemove} disabled={saving} className="flex-shrink-0 text-stone-400 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-1" title="Hapus">
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}