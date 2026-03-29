'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ImageIcon, Crop, Check, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'

// ─── Ukuran output ────────────────────────────────────────────────────────────
const OUTPUT_SIZE: Record<'video' | 'square', { width: number; height: number; label: string }> = {
  video:  { width: 1280, height: 720,  label: '1280 × 720 px (16:9)' },
  square: { width: 512,  height: 512,  label: '512 × 512 px (1:1)'   },
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface CropRect { x: number; y: number; width: number; height: number }

interface Props {
  value: string | null
  onChange: (url: string | null) => void
  folder: 'berita' | 'umkm' | 'produk'
  label?: string
  aspect?: 'video' | 'square'
}

// ─── Utility: gambar → canvas crop → Blob ────────────────────────────────────
function cropAndResize(
  img: HTMLImageElement,
  crop: CropRect,          // koordinat dalam pixel di atas natural image
  outW: number,
  outH: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width  = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')
    if (!ctx) return reject(new Error('Canvas not supported'))
    ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, outW, outH)
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
      'image/webp',
      0.88,
    )
  })
}

// ─── Sub-komponen: CropModal ──────────────────────────────────────────────────
interface CropModalProps {
  src: string               // object-URL dari file asli
  aspect: 'video' | 'square'
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

function CropModal({ src, aspect, onConfirm, onCancel }: CropModalProps) {
  const imgRef       = useRef<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // box      = koordinat crop dalam ruang CONTAINER (px dari pojok kiri-atas container)
  // imgRect  = posisi & ukuran gambar yang BENAR-BENAR tampil di dalam container
  //            (object-contain → gambar bisa lebih kecil dari container karena letterbox)
  const [box,         setBox]         = useState<CropRect | null>(null)
  const [imgRect,     setImgRect]     = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })
  const [zoom,        setZoom]        = useState(1)
  const [dragging,    setDragging]    = useState<'move' | 'resize' | null>(null)
  const [dragStart,   setDragStart]   = useState({ mx: 0, my: 0, bx: 0, by: 0, bw: 0, bh: 0 })
  const [isLoaded,    setIsLoaded]    = useState(false)
  const [processing,  setProcessing]  = useState(false)

  const targetAspect = aspect === 'video' ? 16 / 9 : 1

  // ─── Ukur posisi & ukuran GAMBAR (bukan container) via getBoundingClientRect ───
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

  // Inisialisasi crop box default di tengah gambar (bukan container)
  const initBox = useCallback(() => {
    const r = measureImg()
    if (!r) return
    setImgRect(r)

    let bw: number, bh: number
    if (r.w / r.h > targetAspect) {
      bh = r.h * 0.9
      bw = bh * targetAspect
    } else {
      bw = r.w * 0.9
      bh = bw / targetAspect
    }
    bw = Math.round(bw)
    bh = Math.round(bh)
    // Posisi box relatif terhadap CONTAINER (bukan gambar) agar overlay overlay tepat
    setBox({
      x: Math.round(r.x + (r.w - bw) / 2),
      y: Math.round(r.y + (r.h - bh) / 2),
      width: bw, height: bh,
    })
  }, [measureImg, targetAspect])

  // Saat gambar selesai dimuat → ukur imgRect & inisialisasi box
  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    imgRef.current = img
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
    // Tunggu satu frame agar browser selesai layout gambar
    requestAnimationFrame(() => { initBox(); setIsLoaded(true) })
  }

  // Drag handle
  const handleMouseDown = (e: React.MouseEvent, mode: 'move' | 'resize') => {
    e.preventDefault()
    if (!box) return
    setDragging(mode)
    setDragStart({ mx: e.clientX, my: e.clientY, bx: box.x, by: box.y, bw: box.width, bh: box.height })
  }

  useEffect(() => {
    if (!dragging || !box) return
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.mx
      const dy = e.clientY - dragStart.my

      if (dragging === 'move') {
        // Batasi agar box tidak keluar dari area GAMBAR (bukan container)
        const nx = Math.max(imgRect.x, Math.min(imgRect.x + imgRect.w - box.width,  dragStart.bx + dx))
        const ny = Math.max(imgRect.y, Math.min(imgRect.y + imgRect.h - box.height, dragStart.by + dy))
        setBox(b => b ? { ...b, x: Math.round(nx), y: Math.round(ny) } : b)
      } else {
        // Resize: jaga aspect ratio, pertahankan titik kiri-atas
        let nw = Math.max(80, dragStart.bw + dx)
        let nh = nw / targetAspect
        if (dragStart.bx + nw > imgRect.x + imgRect.w) { nw = imgRect.x + imgRect.w - dragStart.bx; nh = nw / targetAspect }
        if (dragStart.by + nh > imgRect.y + imgRect.h) { nh = imgRect.y + imgRect.h - dragStart.by; nw = nh * targetAspect }
        setBox(b => b ? { ...b, width: Math.round(nw), height: Math.round(nh) } : b)
      }
    }
    const onUp = () => setDragging(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, dragStart, box, imgRect, targetAspect])

  // Reset ke default
  const handleReset = () => initBox()

  // Konfirmasi → konversi koordinat ke natural → crop + resize → blob
  const handleConfirm = async () => {
    if (!imgRef.current || !box) return
    setProcessing(true)
    try {
      // 1. Konversi koordinat box (relatif container) → relatif gambar tampil
      const boxInImg: CropRect = {
        x:      box.x - imgRect.x,
        y:      box.y - imgRect.y,
        width:  box.width,
        height: box.height,
      }
      // 2. Scale ke piksel natural (gambar sesungguhnya)
      const scaleX = naturalSize.w / imgRect.w
      const scaleY = naturalSize.h / imgRect.h
      const naturalCrop: CropRect = {
        x:      Math.round(boxInImg.x      * scaleX),
        y:      Math.round(boxInImg.y      * scaleY),
        width:  Math.round(boxInImg.width  * scaleX),
        height: Math.round(boxInImg.height * scaleY),
      }
      const { width: outW, height: outH } = OUTPUT_SIZE[aspect]
      const blob = await cropAndResize(imgRef.current, naturalCrop, outW, outH)
      onConfirm(blob)
    } catch (err) {
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  const { label: sizeLabel } = OUTPUT_SIZE[aspect]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Crop className="w-4 h-4 text-primary-500" />
              Crop &amp; Resize Gambar
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Output: {sizeLabel} · Format WebP
            </p>
          </div>
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Canvas area */}
        <div className="relative bg-gray-900 select-none overflow-hidden" style={{ height: 360 }}>
          <div
            ref={containerRef}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="Crop preview"
              onLoad={handleImgLoad}
              className="max-w-full max-h-full object-contain"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center', userSelect: 'none', display: 'block' }}
              draggable={false}
            />
          </div>

          {/* Overlay + crop box */}
          {isLoaded && box && (
            <>
              {/* Dark overlay 4 sisi — koordinat relatif container */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bg-black/55" style={{ top: 0, left: 0, right: 0, height: box.y }} />
                <div className="absolute bg-black/55" style={{ top: box.y + box.height, left: 0, right: 0, bottom: 0 }} />
                <div className="absolute bg-black/55" style={{ top: box.y, left: 0, width: box.x, height: box.height }} />
                <div className="absolute bg-black/55" style={{ top: box.y, left: box.x + box.width, right: 0, height: box.height }} />
              </div>

              {/* Crop border */}
              <div
                className="absolute border-2 border-white cursor-move"
                style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
                onMouseDown={e => handleMouseDown(e, 'move')}
              >
                {/* Grid lines (rule of thirds) */}
                <div className="absolute inset-0 pointer-events-none">
                  {[1/3, 2/3].map(f => (
                    <div key={`h${f}`} className="absolute border-white/30 border-dashed" style={{ top: `${f * 100}%`, left: 0, right: 0, borderTopWidth: 1 }} />
                  ))}
                  {[1/3, 2/3].map(f => (
                    <div key={`v${f}`} className="absolute border-white/30 border-dashed" style={{ left: `${f * 100}%`, top: 0, bottom: 0, borderLeftWidth: 1 }} />
                  ))}
                </div>
                {/* Corner handles */}
                {[
                  'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
                  'top-0 right-0 translate-x-1/2 -translate-y-1/2',
                  'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
                ].map((cls, i) => (
                  <div key={i} className={`absolute w-3 h-3 bg-white border-2 border-gray-500 rounded-sm pointer-events-none ${cls}`} />
                ))}
                {/* Resize handle (bottom-right) */}
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 bg-white border-2 border-gray-500 rounded-sm cursor-se-resize translate-x-1/2 translate-y-1/2"
                  onMouseDown={e => { e.stopPropagation(); handleMouseDown(e, 'resize') }}
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

        {/* Zoom controls */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-500 mr-1">Zoom:</span>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1 hover:bg-gray-200 rounded">
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <input
            type="range" min={0.5} max={3} step={0.05} value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="w-28 accent-green-500"
          />
          <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1 hover:bg-gray-200 rounded">
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-xs text-gray-400 ml-1">{Math.round(zoom * 100)}%</span>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Crop
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Batal
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isLoaded || processing}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
export default function ImageCropUpload({
  value, onChange, folder, label = 'Gambar', aspect = 'video',
}: Props) {
  const inputRef    = useRef<HTMLInputElement>(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [isDragging,setIsDragging]= useState(false)

  const [cropSrc,     setCropSrc]     = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  const aspectClass = aspect === 'square' ? 'aspect-square' : 'aspect-video'
  const { label: sizeLabel } = OUTPUT_SIZE[aspect]

  const handleFile = (file: File) => {
    setError(null)
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      setError('Format harus JPG, PNG, WEBP, atau GIF')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran file maksimal 10MB')
      return
    }
    const url = URL.createObjectURL(file)
    setPendingFile(file)
    setCropSrc(url)
  }

  const handleCropConfirm = async (blob: Blob) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setPendingFile(null)

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', blob, 'image.webp')
      fd.append('folder', folder)

      const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal upload')
      onChange(data.url)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setPendingFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <>
      {cropSrc && (
        <CropModal
          src={cropSrc}
          aspect={aspect}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {label}
          <span className="ml-1.5 text-xs font-normal text-gray-400">({sizeLabel})</span>
        </label>

        {value ? (
          <div className="relative group">
            <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden bg-gray-100 border border-gray-200`}>
              <Image src={value} alt={label} fill className="object-cover" unoptimized />
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-2 right-2 flex items-center gap-1.5 text-xs bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Crop className="w-3 h-3" /> Ganti &amp; Crop
            </button>
          </div>
        ) : (
          <div
            onClick={() => !loading && inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            className={`w-full ${aspectClass} border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors
              ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50'}
              ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {loading
              ? <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-2" />
              : <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
            }
            <p className="text-sm font-medium text-gray-600">
              {loading ? 'Mengupload...' : 'Klik atau drag & drop'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP — Maks. 10MB</p>
            {!loading && (
              <span className="mt-2 flex items-center gap-1 text-xs text-primary-500 font-medium">
                <Crop className="w-3 h-3" /> Akan dibuka editor crop
              </span>
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>
    </>
  )
}