import Link from 'next/link'
import { ArrowRight, MessageCircle, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { prisma } from '@/lib/prisma'

export const revalidate = 600

export default async function CTASection() {
  let profil: { nama_desa: string | null; visi: string | null } | null = null
  try {
    profil = await prisma.profilDesa.findFirst({
      select: { nama_desa: true, visi: true },
    })
  } catch {
    // DB down — pakai fallback
  }

  const namaDesa = profil?.nama_desa ?? 'Desa Sukobubuk'
  const visiSingkat =
    profil?.visi?.split('.')[0]?.trim() ??
    'Mewujudkan desa yang mandiri, sejahtera, dan berbudaya.'

  return (
    <Section
      variant="dark"
      spacing="loose"
      pattern="grain"
      size="narrow"
      className="bg-sage-900 text-center"
    >
      <Quote className="mx-auto mb-6 size-10 text-sage-300/80 drop-shadow-sm" />

      <p className="font-display text-2xl font-medium italic leading-snug text-white text-balance drop-shadow-[0_1px_6px_rgba(0,0,0,0.3)] md:text-3xl lg:text-4xl">
        &ldquo;{visiSingkat}.&rdquo;
      </p>

      <p className="mt-4 text-sm font-medium text-stone-200">
        — Visi {namaDesa}
      </p>

      <div className="my-10 h-px w-16 bg-white/20 mx-auto" />

      <h2 className="font-display text-xl font-medium text-white md:text-2xl">
        Ada yang ingin ditanyakan atau disampaikan?
      </h2>
      <p className="mt-2 max-w-md mx-auto text-sm leading-relaxed text-stone-200">
        Tim pelayanan desa siap merespons pertanyaan, kritik, dan masukan
        Anda. Hubungi kami lewat WhatsApp atau kirim pesan melalui form
        kontak.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          asChild
          size="lg"
          variant="accent"
          className="shadow-elevated-3"
        >
          <Link href="/kontak">
            <MessageCircle className="size-4" data-icon="inline-start" />
            Hubungi kami
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="border-white/25 bg-white/5 text-white backdrop-blur hover:border-white/40 hover:bg-white/10 hover:text-white"
        >
          <Link href="/umkm">
            Direktori UMKM
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </Section>
  )
}
