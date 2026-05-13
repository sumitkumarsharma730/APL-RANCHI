import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format confidence as percentage
 */
export function formatConfidence(value) {
  return `${Math.round(value * 100)}%`
}

/**
 * Animate number counting
 */
export function countToNumber(target, duration = 1000) {
  let start = 0
  const increment = target / (duration / 16)
  const timer = setInterval(() => {
    start += increment
    if (start >= target) {
      start = target
      clearInterval(timer)
    }
  }, 16)
  return start
}

/**
 * Generate cricket-themed gradient
 */
export function getCricketGradient(index = 0) {
  const gradients = [
    'from-amber-500 via-orange-500 to-red-500',
    'from-cyan-500 via-blue-500 to-purple-500',
    'from-emerald-500 via-teal-500 to-cyan-500',
    'from-purple-500 via-pink-500 to-rose-500',
  ]
  return gradients[index % gradients.length]
}