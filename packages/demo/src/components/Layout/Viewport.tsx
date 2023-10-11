'use client'
import { LayoutContext } from './LayoutContext'

import { type ReactNode, type ComponentProps } from 'react'
import { useContextSelector } from 'use-context-selector'

type ViewportProps = ComponentProps<'div'>

export function Viewport(props: ViewportProps): ReactNode {
  const viewportRef = useContextSelector(LayoutContext, (context) => context.viewportRef)

  return <div {...props} ref={viewportRef} />
}
