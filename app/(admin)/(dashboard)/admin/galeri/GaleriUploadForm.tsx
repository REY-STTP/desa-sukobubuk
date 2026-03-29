'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Loader2, CheckCircle, AlertCircle, ImagePlus, Crop, Check, X, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'

// ─── Output size galeri ───────────────────────────────────────────────────────
const OUT_W = 800
const OUT_H = 800

// ─── Utility: crop + resize → Blob ───────────────────────────────────────────
function cropAndResize(
  img: HTMLImageElement,
  crop: { x: number; y: number; width: number; height: number },
  outW: number, outH: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width  = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')
    if (!ctx) return reject(new Error('Canvas not supported'))
    ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, outW, outH)
    canvas.toBlob(
      b => b ? resolve(b) : reject(new Error('toBlob failed')),
      'image/webp', 0.88,
    )
  })
}

// ─── CropModal (1:1 square) ───────────────────────────────────────────────────
interface CropModalProps {
  src: string
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

function CropModal({ src, onConfirm, onCancel }: CropModalProps) {
  const imgRef       = useRef<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  type Rect = { x: number; y: number; width: number; height: number }
  const [box,        setBox]        = useState<Rect | null>(null)
  const [imgRect,    setImgRect]    = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [naturalSize,setNaturalSize]= useState({ w: 0, h: 0 })
  const [dragging,   setDragging]   = useState<'move' | 'resize' | null>(null)
  const [dragStart,  setDragStart]  = useState({ mx: 0, my: 0, bx: 0, by: 0, bs: 0 })
  const [isLoaded,   setIsLoaded]   = useState(false)
  const [processing, setProcessing] = useState(false)

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
    // Kotak crop default = 85% dari sisi terpendek gambar, di tengah GAMBAR (1:1)
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
    requestAnimationFrame(() => { initBox(); setIsLoaded(true) })
  }

  const onMouseDown = (e: React.MouseEvent, mode: 'move' | 'resize') => {
    e.preventDefault()
    if (!box) return
    setDragging(mode)
    setDragStart({ mx: e.clientX, my: e.clientY, bx: box.x, by: box.y, bs: box.width })
  }

  useEffect(() => {
    if (!dragging || !box) return
    const mv = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.mx
      const dy = e.clientY - dragStart.my
      if (dragging === 'move') {
        const newX = Math.max(imgRect.x, Math.min(imgRect.x + imgRect.w - box.width,  dragStart.bx + dx))
        const newY = Math.max(imgRect.y, Math.min(imgRect.y + imgRect.h - box.height, dragStart.by + dy))
        setBox(b => b ? { ...b, x: Math.round(newX), y: Math.round(newY) } : b)
      } else {
        // Resize: jaga kotak tetap square (1:1) & dalam batas gambar
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
      const blob = await cropAndResize(imgRef.current, natCrop, OUT_W, OUT_H)
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
              <Crop className="w-4 h-4 text-primary-500" /> Crop Foto Galeri
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Output: 800 × 800 px (1:1) · WebP</p>
          </div>
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
        </div>

        {/* Image area */}
        <div
          ref={containerRef}
          className="relative bg-gray-900 select-none overflow-hidden flex items-center justify-center"
          style={{ height: 380 }}
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

              {/* Grid rule-of-thirds */}
              <div className="absolute pointer-events-none border-2 border-white/80"
                style={{ left: box.x, top: box.y, width: box.width, height: box.height }}>
                {[1/3, 2/3].map(f => (
                  <div key={`h${f}`} className="absolute border-white/30 border-dashed"
                    style={{ top: `${f * 100}%`, left: 0, right: 0, borderTopWidth: 1 }} />
                ))}
                {[1/3, 2/3].map(f => (
                  <div key={`v${f}`} className="absolute border-white/30 border-dashed"
                    style={{ left: `${f * 100}%`, top: 0, bottom: 0, borderLeftWidth: 1 }} />
                ))}
              </div>

              {/* Kotak crop draggable */}
              <div
                className="absolute cursor-move"
                style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
                onMouseDown={e => onMouseDown(e, 'move')}
              >
                {/* Corner handles */}
                {(['tl','tr','bl'] as const).map(c => (
                  <div key={c} className={`absolute w-3 h-3 bg-white border-2 border-gray-500 rounded-sm pointer-events-none
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
          <p className="text-xs text-gray-400 italic">Kotak = area yang akan di-crop (1:1)</p>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
            <button
              onClick={handleConfirm}
              disabled={!isLoaded || processing}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-60 transition-colors"
            >
              {processing
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Memproses...</>
                : <><Check className="w-3.5 h-3.5" /> Terapkan &amp; Upload</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function GaleriUploadForm() {
  const router  = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [judul,      setJudul]      = useState('')
  const [preview,    setPreview]    = useState<string | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [alert,      setAlert]      = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [cropSrc,    setCropSrc]    = useState<string | null>(null)
  const [croppedBlob,setCroppedBlob]= useState<Blob | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { setAlert({ type: 'error', msg: 'Ukuran file maksimal 10MB' }); return }
    setCropSrc(URL.createObjectURL(f))
  }

  const handleCropConfirm = (blob: Blob) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setCroppedBlob(blob)
    setPreview(URL.createObjectURL(blob))
  }

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!judul.trim()) { setAlert({ type: 'error', msg: 'Judul foto wajib diisi' }); return }
    if (!croppedBlob) { setAlert({ type: 'error', msg: 'Pilih dan crop foto terlebih dahulu' }); return }

    setLoading(true); setAlert(null)
    try {
      const formData = new FormData()
      formData.append('judul', judul)
      formData.append('foto', croppedBlob, 'foto.webp')

      const res  = await fetch('/api/admin/galeri', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal upload foto')

      setAlert({ type: 'success', msg: 'Foto berhasil diupload!' })
      setJudul(''); setCroppedBlob(null)
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
      if (inputRef.current) inputRef.current.value = ''
      router.refresh()
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.message })
    }
    setLoading(false)
  }

  return (
    <>
      {cropSrc && <CropModal src={cropSrc} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />}

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Upload Foto Baru</h2>
        <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
          <Crop className="w-3 h-3" /> Foto akan di-crop ke ukuran 800 × 800 px (1:1) secara otomatis
        </p>

        {alert && (
          <div className={`flex items-center gap-2.5 rounded-xl p-3.5 text-sm mb-4 ${alert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {alert.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {alert.msg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Preview area — 1:1 */}
          <label className="cursor-pointer">
            <div className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${preview ? 'border-transparent' : 'border-gray-200 hover:border-primary-400 bg-gray-50'}`}>
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <>
                  <ImagePlus className="w-10 h-10 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Klik untuk pilih foto</p>
                  <p className="text-xs text-gray-300 mt-1">JPG, PNG, WEBP maks. 10MB</p>
                  <span className="mt-2 text-xs text-primary-500 font-medium flex items-center gap-1">
                    <Crop className="w-3 h-3" /> Editor crop 1:1 akan terbuka
                  </span>
                </>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          {/* Form fields */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul Foto</label>
              <input
                type="text" value={judul} onChange={e => setJudul(e.target.value)}
                placeholder="Contoh: Acara HUT Kemerdekaan RI"
                className="input-field" disabled={loading}
              />
              {croppedBlob && (
                <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Foto sudah di-crop (1:1) — siap upload
                </p>
              )}
            </div>

            <div className="space-y-2">
              {croppedBlob && (
                <button
                  type="button"
                  onClick={() => { if (preview) URL.revokeObjectURL(preview); setPreview(null); setCroppedBlob(null); if (inputRef.current) inputRef.current.value = '' }}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-red-500 py-2 border border-gray-200 hover:border-red-200 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Ganti Foto
                </button>
              )}
              <button
                onClick={handleSubmit} disabled={loading}
                className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengupload...</> : <><Upload className="w-4 h-4" /> Upload Foto</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}