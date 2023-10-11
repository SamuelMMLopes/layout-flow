'use client'
import { type Item as ItemComponent } from './Item'
import { LayoutContext } from './LayoutContext'

import {
  type CSSProperties,
  useMemo,
  type ComponentProps,
  type ReactNode,
  memo,
  useCallback,
  useState,
  type MouseEvent,
} from 'react'
import { Item } from '@layout-flow/core'
import { useContextSelector } from 'use-context-selector'

type InternalItemProps = ComponentProps<typeof ItemComponent> & {
  item: Item
  sliceHeight: number
  sliceWidth: number
  gap: number
}

function InternalItemComponent({
  item,
  sliceHeight,
  sliceWidth,
  gap,
  style,
  ...props
}: InternalItemProps): ReactNode {
  const onDragStart = useContextSelector(LayoutContext, (context) => context.onDragStart)
  const onDragEnd = useContextSelector(LayoutContext, (context) => context.onDragEnd)
  const canEdit = useContextSelector(LayoutContext, (context) => context.canEdit)
  const [isDragging, setIsDragging] = useState(false)
  const height = useMemo(() => `${item.calculateHeight({ sliceHeight, gap })}px`, [gap, item, sliceHeight])
  const width = useMemo(() => `${item.calculateWidth({ sliceWidth, gap })}px`, [gap, item, sliceWidth])
  const left = useMemo(() => `${item.calculateXAxis({ sliceWidth, gap })}px`, [gap, item, sliceWidth])
  const top = useMemo(() => `${item.calculateYAxis({ sliceHeight, gap })}px`, [gap, item, sliceHeight])
  const mergedStyle: CSSProperties = useMemo(
    () => ({
      ...style,
      '--item-height': height,
      '--item-width': width,
      position: 'absolute',
      height,
      width,
      left,
      top,
      transition:
        'height 125ms linear 125ms,width 125ms linear 0s,top 175ms ease-out,left 175ms ease-out,right 175ms ease-out',
    }),
    [height, left, style, top, width],
  )

  const handleDragStart = useCallback(
    (event: MouseEvent) => {
      onDragStart({ item, event })
    },
    [item, onDragStart],
  )

  const handleDragEnd = useCallback(
    (event: MouseEvent) => {
      onDragEnd(event)
      setIsDragging(false)
    },
    [onDragEnd],
  )

  return (
    <div
      {...props}
      draggable={canEdit}
      data-is-dragging={isDragging}
      data-allow-drag={canEdit}
      style={mergedStyle}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <h1>{item.id}</h1>
    </div>
  )
}

export const InternalItem = memo(InternalItemComponent)
