'use client'
import { LayoutProvider } from './LayoutContext'

import { type ReactNode, type ComponentProps } from 'react'

type RootProps = ComponentProps<typeof LayoutProvider>

export function Root(props: RootProps): ReactNode {
  return <LayoutProvider {...props} />
}
