'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface LoadingContextValue {
  isLoading: boolean
  setIsLoading: (v: boolean) => void
}

const LoadingContext = createContext<LoadingContextValue>({
  isLoading: false,
  setIsLoading: () => {},
})

export function useLoading(): LoadingContextValue {
  return useContext(LoadingContext)
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}
