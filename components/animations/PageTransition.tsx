'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface Props {
  children: React.ReactNode
}

const variants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' as const } },
}

export default function PageTransition({ children }: Props) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
