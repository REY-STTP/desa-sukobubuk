'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { X, Loader2, Crop, Check, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'

/**
 * F2-Fase4 / T-40 — CropModal bersama.
 *
 * Menggantikan 3 implementasi nyaris identik (`cropAndResize` + modal
 * drag/zoom/crop) yang sebelumnya tersebar di:
 * - `components/admin/ImageCropUpload.tsx` (aspect video|square + zoom)
 * - `app/.../admin/galeri/GaleriUploadForm.tsx` (square 800, tanpa zoom)
 * - `app/.../admin/profil/PejabatForm.tsx` (square 512 + pratinjau lingkaran)
 *
 * Perbedaan antar pemakai diparameterkan (judul, ukuran output, overlay,
 * zoom, footer) sehingga tampilan & perilaku tiap jalur IDENTIK seperti
 * sebelum ekstraksi. Selalu dimuat via `dynamic(..., { ssr: false })`
 * dari pemanggil agar chunk ini hanya terunduh saat modal dibuka.
 */

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

export type CropAspect = 'square' | 'video'

/** Gaya overlay area crop: bingkai grid terpisah / grid di dalam box / lingkaran. */
export type CropOverlay = 'grid-frame' | 'grid-box' | 'circle-box'

// ─── Utility: gambar → canvas crop → Blob (WebP) ─────────────────────────────
export function cropAndResize(
  img: HTMLImageElement,
  crop: CropRect, // koordinat dalam pixel di atas natural image
  outW: number,
  outH: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')
    if (!ctx) return reject(new Error('Canvas not supported'))
    ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, outW, outH)
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))), 'image/webp', 0.88)
  })
}

export interface SharedCropModalProps {
  src: string // object-URL dari file asli
  title: string // mis. 'Crop Foto Galeri'
  sizeLabel: string // mis. '800 × 800 px (1:1)'
  outputWidth: number
  outputHeight: number
  aspect?: CropAspect // default 'square'
  /** Fraksi awal box terhadap sisi gambar (0.9 = warisan editor, 0.85 = warisan galeri/pejabat). */
  initialFill?: number
  showZoom?: boolean
  overlay?: CropOverlay
  /** Tinggi area kanvas px (360 warisan editor/pejabat, 380 warisan galeri). */
  height?: number
  /** true → max-w-2xl (warisan editor), false → max-w-lg. */
  wide?: boolean
  footerHint?: string
  /** true → footer bergaris bg-stone-50 (warisan galeri/pejabat). */
  footerBar?: boolean
  resetLabel?: string // default 'Reset Crop'
  confirmLabel?: string // default 'Terapkan & Upload'
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

export function CropModal({
  src,
  title,
  sizeLabel,
  outputWidth,
  outputHeight,
  aspect = 'square',
  initialFill = 0.9,
  showZoom = false,
  overlay = 'grid-box',
  height = 360,
  wide = false,
  footerHint,
  footerBar = false,
  resetLabel = 'Reset Crop',
  confirmLabel = 'Terapkan & Upload',
  onConfirm,
  onCancel,
}: SharedCropModalProps) {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // box     = koordinat crop dalam ruang CONTAINER (px dari pojok kiri-atas)
  // imgRect = posisi & ukuran gambar yang BENAR-BENAR tampil (object-contain
  //           → bisa lebih kecil dari container karena letterbox)
  const [box, setBox] = useState<CropRect | null>(null)
  const [imgRect, setImgRect] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })
  const [zoom, setZoom] = useState(1)
  const [dragging, setDragging] = useState<'move' | 'resize' | null>(null)
  const [dragStart, setDragStart] = useState({ mx: 0, my: 0, bx: 0, by: 0, bw: 0, bh: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const [processing, setProcessing] = useState(false)

  const targetAspect = aspect === 'video' ? 16 / 9 : 1
  const minBox = aspect === 'video' ? 80 : 40

  // ─── Ukur posisi & ukuran GAMBAR (bukan container) via getBoundingClientRect ───
  const measureImg = useCallback(() => {
    const img = imgRef.current
    const cont = containerRef.current
    if (!img || !cont) return null
    const cRect = cont.getBoundingClientRect()
    const iRect = img.getBoundingClientRect()
    return {
      x: iRect.left - cRect.left,
      y: iRect.top - cRect.top,
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
      bh = r.h * initialFill
      bw = bh * targetAspect
    } else {
      bw = r.w * initialFill
      bh = bw / targetAspect
    }
    bw = Math.round(bw)
    bh = Math.round(bh)
    // Posisi box relatif terhadap CONTAINER agar overlay tepat
    setBox({
      x: Math.round(r.x + (r.w - bw) / 2),
      y: Math.round(r.y + (r.h - bh) / 2),
      width: bw,
      height: bh,
    })
  }, [measureImg, targetAspect, initialFill])

  // Saat gambar selesai dimuat → ukur imgRect & inisialisasi box
  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    imgRef.current = img
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
    // Tunggu satu frame agar browser selesai layout gambar
    requestAnimationFrame(() => {
      initBox()
      setIsLoaded(true)
    })
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
        const nx = Math.max(imgRect.x, Math.min(imgRect.x + imgRect.w - box.width, dragStart.bx + dx))
        const ny = Math.max(imgRect.y, Math.min(imgRect.y + imgRect.h - box.height, dragStart.by + dy))
        setBox((b) => (b ? { ...b, x: Math.round(nx), y: Math.round(ny) } : b))
      } else if (aspect === 'square') {
        // Resize square: sisi mengikuti max(dx, dy), dalam batas gambar
        let s = Math.max(minBox, dragStart.bw + Math.max(dx, dy))
        s = Math.min(s, imgRect.w, imgRect.h)
        if (dragStart.bx + s > imgRect.x + imgRect.w) s = imgRect.x + imgRect.w - dragStart.bx
        if (dragStart.by + s > imgRect.y + imgRect.h) s = imgRect.y + imgRect.h - dragStart.by
        setBox((b) => (b ? { ...b, width: Math.round(s), height: Math.round(s) } : b))
      } else {
        // Resize: jaga aspect ratio, pertahankan titik kiri-atas
        let nw = Math.max(minBox, dragStart.bw + dx)
        let nh = nw / targetAspect
        if (dragStart.bx + nw > imgRect.x + imgRect.w) {
          nw = imgRect.x + imgRect.w - dragStart.bx
          nh = nw / targetAspect
        }
        if (dragStart.by + nh > imgRect.y + imgRect.h) {
          nh = imgRect.y + imgRect.h - dragStart.by
          nw = nh * targetAspect
        }
        setBox((b) => (b ? { ...b, width: Math.round(nw), height: Math.round(nh) } : b))
      }
    }
    const onUp = () => setDragging(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging, dragStart, box, imgRect, targetAspect, aspect, minBox])

  // Reset ke default
  const handleReset = () => initBox()

  // Konfirmasi → konversi koordinat ke natural → crop + resize → blob
  const handleConfirm = async () => {
    if (!imgRef.current || !box) return
    setProcessing(true)
    try {
      // 1. Konversi koordinat box (relatif container) → relatif gambar tampil
      const boxInImg: CropRect = {
        x: box.x - imgRect.x,
        y: box.y - imgRect.y,
        width: box.width,
        height: box.height,
      }
      // 2. Scale ke piksel natural (gambar sesungguhnya)
      const scaleX = naturalSize.w / imgRect.w
      const scaleY = naturalSize.h / imgRect.h
      const naturalCrop: CropRect = {
        x: Math.round(boxInImg.x * scaleX),
        y: Math.round(boxInImg.y * scaleY),
        width: Math.round(boxInImg.width * scaleX),
        height: Math.round(boxInImg.height * scaleY),
      }
      const blob = await cropAndResize(imgRef.current, naturalCrop, outputWidth, outputHeight)
      onConfirm(blob)
    } catch (err) {
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onCancel}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div>
            <h3 className="font-semibold text-stone-800 flex items-center gap-2">
              <Crop className="size-4 text-primary-500" />
              {title}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">Output: {sizeLabel} · Format WebP</p>
          </div>
          <button onClick={onCancel} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="size-4 text-stone-500" />
          </button>
        </div>

        {/* Canvas area */}
        <div
          ref={containerRef}
          className="relative bg-sage-900 select-none overflow-hidden flex items-center justify-center"
          style={{ height }}
        >
          <img
            src={src}
            alt="Crop preview"
            onLoad={handleImgLoad}
            className="max-w-full max-h-full object-contain"
            style={
              showZoom
                ? { transform: `scale(${zoom})`, transformOrigin: 'center', userSelect: 'none', display: 'block' }
                : { userSelect: 'none', display: 'block' }
            }
            draggable={false}
          />

          {/* Overlay + crop box */}
          {isLoaded && box && (
            <>
              {/* Dark overlay 4 sisi — koordinat relatif container */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bg-black/55" style={{ top: 0, left: 0, right: 0, height: box.y }} />
                <div
                  className="absolute bg-black/55"
                  style={{ top: box.y + box.height, left: 0, right: 0, bottom: 0 }}
                />
                <div
                  className="absolute bg-black/55"
                  style={{ top: box.y, left: 0, width: box.x, height: box.height }}
                />
                <div
                  className="absolute bg-black/55"
                  style={{ top: box.y, left: box.x + box.width, right: 0, height: box.height }}
                />
              </div>

              {overlay === 'circle-box' && (
                /* Pratinjau lingkaran (warisan form pejabat) */
                <div
                  className="absolute pointer-events-none rounded-full border-2 border-white/50 border-dashed"
                  style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
                />
              )}

              {overlay === 'grid-frame' && (
                /* Grid rule-of-thirds terpisah (warisan form galeri) */
                <div
                  className="absolute pointer-events-none border-2 border-white/80"
                  style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
                >
                  {[1 / 3, 2 / 3].map((f) => (
                    <div
                      key={`h${f}`}
                      className="absolute border-white/30 border-dashed"
                      style={{ top: `${f * 100}%`, left: 0, right: 0, borderTopWidth: 1 }}
                    />
                  ))}
                  {[1 / 3, 2 / 3].map((f) => (
                    <div
                      key={`v${f}`}
                      className="absolute border-white/30 border-dashed"
                      style={{ left: `${f * 100}%`, top: 0, bottom: 0, borderLeftWidth: 1 }}
                    />
                  ))}
                </div>
              )}

              {/* Kotak crop draggable */}
              <div
                className={`absolute cursor-move ${overlay === 'grid-frame' ? '' : 'border-2 border-white'}`}
                style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
              >
                {overlay === 'grid-box' && (
                  /* Grid di dalam box (warisan editor crop umum) */
                  <div className="absolute inset-0 pointer-events-none">
                    {[1 / 3, 2 / 3].map((f) => (
                      <div
                        key={`h${f}`}
                        className="absolute border-white/30 border-dashed"
                        style={{ top: `${f * 100}%`, left: 0, right: 0, borderTopWidth: 1 }}
                      />
                    ))}
                    {[1 / 3, 2 / 3].map((f) => (
                      <div
                        key={`v${f}`}
                        className="absolute border-white/30 border-dashed"
                        style={{ left: `${f * 100}%`, top: 0, bottom: 0, borderLeftWidth: 1 }}
                      />
                    ))}
                  </div>
                )}
                {/* Corner handles */}
                {(['tl', 'tr', 'bl'] as const).map((c) => (
                  <div
                    key={c}
                    className={`absolute size-3 bg-white border-2 border-stone-400 rounded-sm pointer-events-none
                      ${
                        c === 'tl'
                          ? 'top-0 left-0 -translate-x-1/2 -translate-y-1/2'
                          : c === 'tr'
                            ? 'top-0 right-0 translate-x-1/2 -translate-y-1/2'
                            : 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2'
                      }`}
                  />
                ))}
                {/* Resize handle (bottom-right) */}
                <div
                  className="absolute bottom-0 right-0 size-4 bg-white border-2 border-stone-400 rounded-sm cursor-se-resize translate-x-1/2 translate-y-1/2"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleMouseDown(e, 'resize')
                  }}
                />
              </div>
            </>
          )}

          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-8 animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Zoom controls (warisan editor crop umum) */}
        {showZoom && (
          <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-200 bg-stone-50">
            <span className="text-xs text-stone-500 mr-1">Zoom:</span>
            <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="p-1 hover:bg-stone-200 rounded">
              <ZoomOut className="size-4 text-stone-600" />
            </button>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-28 accent-green-500"
            />
            <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} className="p-1 hover:bg-stone-200 rounded">
              <ZoomIn className="size-4 text-stone-600" />
            </button>
            <span className="text-xs text-stone-400 ml-1">{Math.round(zoom * 100)}%</span>
          </div>
        )}

        {/* Footer actions */}
        <div
          className={`flex items-center justify-between px-5 py-4 ${
            footerBar ? 'bg-stone-50 border-t border-stone-200' : ''
          }`}
        >
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {resetLabel}
          </button>
          {footerHint && <p className="text-xs text-stone-400 italic">{footerHint}</p>}
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isLoaded || processing}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-sage-500 hover:bg-sage-700 text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memproses...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" /> {confirmLabel}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
