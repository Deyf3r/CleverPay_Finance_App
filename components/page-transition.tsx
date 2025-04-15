"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className = "",
}: {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SlideIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  className = "",
}: {
  children: ReactNode
  direction?: "up" | "down" | "left" | "right"
  delay?: number
  duration?: number
  className?: string
}) {
  const directionValues = {
    up: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
    down: { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } },
  }

  const { initial, animate } = directionValues[direction]

  return (
    <motion.div initial={initial} animate={animate} transition={{ delay, duration }} className={className}>
      {children}
    </motion.div>
  )
}

export function ScaleIn({
  children,
  delay = 0,
  duration = 0.5,
  className = "",
}: {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay,
        duration,
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
