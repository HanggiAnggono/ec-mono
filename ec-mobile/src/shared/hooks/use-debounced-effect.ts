import { DependencyList, useEffect, useRef } from 'react'

type DebouncedEffect = () => void

type UseDebouncedEffectOptions = {
  delayMs?: number
}

export const useDebouncedEffect = (
  effect: DebouncedEffect,
  deps: DependencyList,
  options: UseDebouncedEffectOptions = {}
) => {
  const { delayMs = 400 } = options
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const effectRef = useRef<DebouncedEffect>(effect)

  useEffect(() => {
    effectRef.current = effect
  }, [effect])

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      effectRef.current()
    }, delayMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [...deps, delayMs])
}
