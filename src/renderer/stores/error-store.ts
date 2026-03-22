import { create } from 'zustand'
import { useToastStore } from './toast-store'

export type ErrorLevel = 'warn' | 'error' | 'critical'

export interface AppError {
  id: string
  timestamp: number
  level: ErrorLevel
  message: string
  source: string
  stack?: string
}

const MAX_ERRORS = 100
let errorCounter = 0

interface ErrorState {
  errors: AppError[]
  addError: (level: ErrorLevel, message: string, source: string, stack?: string) => void
  dismissError: (id: string) => void
  clearErrors: () => void
}

export const useErrorStore = create<ErrorState>((set) => ({
  errors: [],

  addError: (level, message, source, stack) => {
    const id = `err-${++errorCounter}-${Date.now()}`
    const entry: AppError = { id, timestamp: Date.now(), level, message, source, stack }

    // Always log to console
    const tag = `[${source}]`
    if (level === 'critical') {
      console.error(tag, message, stack || '')
    } else if (level === 'error') {
      console.error(tag, message, stack || '')
    } else {
      console.warn(tag, message)
    }

    // Show toast for error and critical levels
    if (level === 'error' || level === 'critical') {
      useToastStore.getState().pushToast(
        `${source}: ${message}`,
        level === 'critical' ? 'error' : 'warning',
        level === 'critical' ? 8000 : 5000
      )
    }

    set((state) => ({
      errors: [...state.errors.slice(-(MAX_ERRORS - 1)), entry]
    }))
  },

  dismissError: (id) => {
    set((state) => ({
      errors: state.errors.filter((e) => e.id !== id)
    }))
  },

  clearErrors: () => set({ errors: [] })
}))

/**
 * Convenience: log a caught error at 'warn' level.
 * Use for expected failures (not a git repo, file not found on restore).
 */
export function logWarn(source: string, message: string, err?: unknown): void {
  const stack = err instanceof Error ? err.stack : undefined
  useErrorStore.getState().addError('warn', message, source, stack)
}

/**
 * Convenience: log a caught error at 'error' level (shows toast).
 * Use for unexpected failures that affect the user.
 */
export function logError(source: string, message: string, err?: unknown): void {
  const stack = err instanceof Error ? err.stack : undefined
  useErrorStore.getState().addError('error', message, source, stack)
}
