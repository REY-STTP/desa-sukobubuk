'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Users, Plus, Trash2, Loader2, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, Camera, UserCircle2, Save, GripVertical,
  Crop, Check, X, RotateCcw,
} from 'lucide-react'

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

// ─── Utility: crop + resize → Blob ───────────────────────────────────────────
function cropAndResize(
  img: HTMLImageElement,
  crop: { x: number; y: number; width: number; height: number },
  outW: number, outH: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = outW; canvas.height = outH
    const ctx = canvas.getContext('2d')
    if (!ctx) return reject(new Error('Canvas not supported'))
    ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, outW, outH)
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/webp', 0.88)
  })
}

// ─── CropModal (1:1 square, output 512×512) ───────────────────────────────────
interface CropModalProps { src: string; onConfirm: (blob: Blob) => void; onCancel: () => void }

function CropModal({ src, onConfirm, onCancel }: CropModalProps) {
  const imgRef       = useRef<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  type Rect = { x: number; y: number; width: number; height: number }

  // box = koordinat dalam ruang CONTAINER (px dari pojok kiri atas container)
  const [box,       setBox]       = useState<Rect | null>(null)
  // imgRect = posisi & ukuran gambar yang SEBENARNYA tampil di dalam container
  const [imgRect,   setImgRect]   = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })
  const [dragging,  setDragging]  = useState<'move' | 'resize' | null>(null)
  const [dragStart, setDragStart] = useState({ mx: 0, my: 0, bx: 0, by: 0, bs: 0 })
  const [isLoaded,  setIsLoaded]  = useState(false)
  const [processing,setProcessing]= useState(false)

  // Hitung posisi gambar dalam container (gambar di-letterbox oleh object-contain)
  const measureImg = useCallback(() => {
    const img  = imgRef.current
    const cont = containerRef.current
    if (!img || !cont) return null
    const cRect = cont.getBoundingClientRect()
    const iRect = img.getBoundingClientRect()
    return {
      x: iRect.left - cRect.left,
      y: iRect.top  - cRect.top,
      w: iRect.width,
      h: iRect.height,
    }
  }, [])

  const initBox = useCallback(() => {
    const r = measureImg()
    if (!r) return
    setImgRect(r)
    // Kotak crop default = 85% dari sisi terpendek gambar, di tengah GAMBAR
    const s = Math.round(Math.min(r.w, r.h) * 0.85)
    setBox({
      x: Math.round(r.x + (r.w - s) / 2),
      y: Math.round(r.y + (r.h - s) / 2),
      width: s, height: s,
    })
  }, [measureImg])

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    imgRef.current = img
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
    // Tunggu satu frame agar browser selesai layout gambar
    requestAnimationFrame(() => { initBox(); setIsLoaded(true) })
  }

  const onMouseDown = (e: React.MouseEvent, mode: 'move' | 'resize') => {
    e.preventDefault(); if (!box) return
    setDragging(mode)
    setDragStart({ mx: e.clientX, my: e.clientY, bx: box.x, by: box.y, bs: box.width })
  }

  useEffect(() => {
    if (!dragging || !box) return
    const mv = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.mx
      const dy = e.clientY - dragStart.my
      if (dragging === 'move') {
        // Batasi agar box tidak keluar dari area GAMBAR
        const newX = Math.max(imgRect.x, Math.min(imgRect.x + imgRect.w - box.width,  dragStart.bx + dx))
        const newY = Math.max(imgRect.y, Math.min(imgRect.y + imgRect.h - box.height, dragStart.by + dy))
        setBox(b => b ? { ...b, x: Math.round(newX), y: Math.round(newY) } : b)
      } else {
        // Resize: jaga kotak tetap square & dalam batas gambar
        let s = Math.max(40, dragStart.bs + Math.max(dx, dy))
        s = Math.min(s, imgRect.w, imgRect.h)
        if (dragStart.bx + s > imgRect.x + imgRect.w) s = imgRect.x + imgRect.w - dragStart.bx
        if (dragStart.by + s > imgRect.y + imgRect.h) s = imgRect.y + imgRect.h - dragStart.by
        setBox(b => b ? { ...b, width: Math.round(s), height: Math.round(s) } : b)
      }
    }
    const up = () => setDragging(null)
    window.addEventListener('mousemove', mv)
    window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up) }
  }, [dragging, dragStart, box, imgRect])

  const handleConfirm = async () => {
    if (!imgRef.current || !box) return
    setProcessing(true)
    try {
      // Konversi koordinat box (relatif container) → koordinat dalam gambar tampil
      const boxInImg = {
        x: box.x - imgRect.x,
        y: box.y - imgRect.y,
        width:  box.width,
        height: box.height,
      }
      // Scale ke piksel natural
      const scaleX = naturalSize.w / imgRect.w
      const scaleY = naturalSize.h / imgRect.h
      const natCrop = {
        x:      Math.round(boxInImg.x      * scaleX),
        y:      Math.round(boxInImg.y      * scaleY),
        width:  Math.round(boxInImg.width  * scaleX),
        height: Math.round(boxInImg.height * scaleY),
      }
      const blob = await cropAndResize(imgRef.current, natCrop, 512, 512)
      onConfirm(blob)
    } catch (err) {
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Crop className="w-4 h-4 text-primary-500" /> Crop Foto Pejabat
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Output: 512 × 512 px (1:1) · WebP</p>
          </div>
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
        </div>

        {/* Image area */}
        <div
          ref={containerRef}
          className="relative bg-gray-900 select-none overflow-hidden flex items-center justify-center"
          style={{ height: 360 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="crop"
            onLoad={handleLoad}
            className="max-w-full max-h-full object-contain"
            style={{ userSelect: 'none', display: 'block' }}
            draggable={false}
          />

          {isLoaded && box && (
            <>
              {/* Overlay gelap di luar kotak crop */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bg-black/55" style={{ top: 0, left: 0, right: 0, height: box.y }} />
                <div className="absolute bg-black/55" style={{ top: box.y + box.height, left: 0, right: 0, bottom: 0 }} />
                <div className="absolute bg-black/55" style={{ top: box.y, left: 0, width: box.x, height: box.height }} />
                <div className="absolute bg-black/55" style={{ top: box.y, left: box.x + box.width, right: 0, height: box.height }} />
              </div>

              {/* Preview lingkaran */}
              <div className="absolute pointer-events-none rounded-full border-2 border-white/50 border-dashed"
                style={{ left: box.x, top: box.y, width: box.width, height: box.height }} />

              {/* Kotak crop (draggable) */}
              <div
                className="absolute border-2 border-white cursor-move"
                style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
                onMouseDown={e => onMouseDown(e, 'move')}
              >
                {/* Corner handles */}
                {(['tl','tr','bl'] as const).map(c => (
                  <div key={c} className={`absolute w-3 h-3 bg-white border-2 border-gray-500 rounded-sm
                    ${c === 'tl' ? 'top-0 left-0 -translate-x-1/2 -translate-y-1/2' :
                      c === 'tr' ? 'top-0 right-0 translate-x-1/2 -translate-y-1/2' :
                                   'bottom-0 left-0 -translate-x-1/2 translate-y-1/2'}`} />
                ))}
                {/* Resize handle (br) */}
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 bg-white border-2 border-gray-500 rounded-sm cursor-se-resize translate-x-1/2 translate-y-1/2"
                  onMouseDown={e => { e.stopPropagation(); onMouseDown(e, 'resize') }}
                />
              </div>
            </>
          )}

          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-t border-gray-100">
          <button onClick={initBox} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <p className="text-xs text-gray-400 italic">Lingkaran = tampilan di web</p>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
            <button
              onClick={handleConfirm}
              disabled={!isLoaded || processing}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-60 transition-colors"
            >
              {processing
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Memproses...</>
                : <><Check className="w-3.5 h-3.5" /> Terapkan</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

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

  // Saat file dipilih → buka modal crop
  const handleFotoSelect = (idx: number, file: File) => {
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
        setAlert({ type: 'error', msg: 'Nama dan jabatan wajib diisi untuk semua entri.' }); return
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
    } catch (e: any) { setAlert({ type: 'error', msg: e.message }) }
    setSaving(false)
  }

  return (
    <>
      {cropState && (
        <CropModal src={cropState.src} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">Struktur Organisasi</h2>
            <span className="text-xs text-gray-400 ml-1">Pejabat &amp; perangkat desa</span>
          </div>
          <button onClick={addRow} disabled={saving} className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50">
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </div>

        {alert && (
          <div className={`flex items-center gap-2.5 rounded-xl p-3.5 text-sm mb-4 ${alert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {alert.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
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
            <div className="text-center py-10 text-gray-400 text-sm">
              Belum ada pejabat.{' '}
              <button onClick={addRow} className="text-primary-600 underline">Tambah sekarang</button>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
          <button onClick={handleSave} disabled={saving || list.length === 0} className="btn-primary gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4" /> Simpan Struktur</>}
          </button>
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
    <div className="flex gap-3 items-start p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
      {/* Urutan */}
      <div className="flex flex-col items-center gap-0.5 pt-1 flex-shrink-0">
        <button onClick={() => onMove(-1)} disabled={idx === 0 || saving} className="text-gray-300 hover:text-gray-500 disabled:opacity-20 disabled:cursor-not-allowed" title="Naikkan"><ChevronUp className="w-4 h-4" /></button>
        <GripVertical className="w-4 h-4 text-gray-200" />
        <button onClick={() => onMove(1)} disabled={idx === total - 1 || saving} className="text-gray-300 hover:text-gray-500 disabled:opacity-20 disabled:cursor-not-allowed" title="Turunkan"><ChevronDown className="w-4 h-4" /></button>
      </div>

      {/* Foto */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        <div
          onClick={() => !saving && inputRef.current?.click()}
          className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 hover:border-primary-400 cursor-pointer group transition-colors flex items-center justify-center"
          title="Klik untuk pilih & crop foto"
        >
          {pejabat._uploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
          ) : preview ? (
            <>
              <Image src={preview} alt={pejabat.nama || 'Foto pejabat'} fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                <Crop className="w-4 h-4 text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-0.5 text-gray-300 group-hover:text-primary-400 transition-colors">
              <UserCircle2 className="w-7 h-7" />
              <Camera className="w-3 h-3" />
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => e.target.files?.[0] && onFotoChange(e.target.files[0])} />
        <p className="text-[10px] text-gray-400">Foto</p>
      </div>

      {/* Fields */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5 min-w-0">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Nama</label>
          <input type="text" value={pejabat.nama} onChange={e => onChange({ nama: e.target.value })} placeholder="Budi Santoso" className="input-field text-sm" disabled={saving} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Jabatan</label>
          <input type="text" value={pejabat.jabatan} onChange={e => onChange({ jabatan: e.target.value })} placeholder="Kepala Desa" className="input-field text-sm" disabled={saving} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Kategori</label>
          <select value={pejabat.kategori} onChange={e => onChange({ kategori: e.target.value })} className="input-field text-sm" disabled={saving}>
            {KATEGORI_OPTIONS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
        </div>
      </div>

      {/* Hapus */}
      <button onClick={onRemove} disabled={saving} className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-1" title="Hapus">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}