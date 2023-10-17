'use client'
import { type Dispatch, type SetStateAction, useCallback } from 'react'

type SetStateFn<T> = (prevState?: T) => T

type UseControllableStateInput<T = any> = {
  prop: T
  onChange?: (state: T) => void
}

export function useControllableState<T = any>({
  prop,
  onChange = () => {},
}: UseControllableStateInput<T>): readonly [T, Dispatch<SetStateAction<T | undefined>>] {
  const setValue: Dispatch<SetStateAction<T | undefined>> = useCallback(
    (nextValue) => {
      const setter = nextValue as SetStateFn<T>
      const value = typeof nextValue === 'function' ? setter(prop) : nextValue
      if (value !== prop) onChange(value as T)
    },
    [onChange, prop],
  )
  return [prop, setValue] as const
}
