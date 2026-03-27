'use client'

import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import ScrollReveal from '@/components/animations/ScrollReveal'

export default function CTASection() {
  return (
    <section className="section-padding bg-gradient-to-br from-primary-800 to-primary-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-leaf-pattern" />
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full blur-3xl opacity-20"
        animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-64 h-64 bg-sage-600 rounded-full blur-3xl opacity-15"
        animate={{ scale: [1, 1.3, 1], x: [0, -15, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="container-custom relative z-10 text-center">
        <ScrollReveal direction="none">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Ada yang ingin <span className="text-primary-300 italic">ditanyakan?</span>
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
            Kami siap membantu Anda. Kirim pesan atau kunjungi kantor desa kami pada jam pelayanan.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/kontak" className="btn-primary bg-white !text-primary-800 hover:!bg-primary-50 shadow-xl shadow-black/30">
                <MessageCircle className="w-4 h-4" />
                Hubungi Kami
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/umkm" className="inline-flex items-center gap-2 border-2 border-white/30 text-white hover:border-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition-all duration-200">
                Direktori UMKM
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
