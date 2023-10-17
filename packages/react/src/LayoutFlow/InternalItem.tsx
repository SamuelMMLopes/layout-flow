'use client'
import { type OnDragStartInput } from '.'

import {
  type ComponentProps,
  memo,
  useMemo,
  type ReactNode,
  type CSSProperties,
  useState,
  type MouseEvent,
  useCallback,
} from 'react'
import { type Item } from '@layout-flow/core'

type ItemProps = ComponentProps<'div'> & {
  item: Item
  sliceHeight: number
  sliceWidth: number
  gap: number
  canEdit: boolean
  onDragStart: (input: OnDragStartInput) => void
  onDragEnd: (event: MouseEvent) => void
}

function InternalItemComponent({
  item,
  sliceHeight,
  sliceWidth,
  gap,
  canEdit,
  style,
  onDragStart,
  onDragEnd,
  ...props
}: ItemProps): ReactNode {
  const [isDragging, setIsDragging] = useState(false)
  const height = useMemo(() => `${item.calculateHeight({ sliceHeight, gap })}px`, [gap, item, sliceHeight])
  const width = useMemo(() => `${item.calculateWidth({ sliceWidth, gap })}px`, [gap, item, sliceWidth])
  const xAxis = useMemo(() => `${item.calculateXAxis({ sliceWidth, gap })}px`, [gap, item, sliceWidth])
  const yAxis = useMemo(() => `${item.calculateYAxis({ sliceHeight, gap })}px`, [gap, item, sliceHeight])
  const mergedStyle: CSSProperties = useMemo(
    () => ({
      ...style,
      '--layout-flow-item-height': height,
      '--layout-flow-item-width': width,
      position: 'absolute',
      height,
      width,
      left: xAxis,
      top: yAxis,
      transition:
        'height 125ms linear 125ms,width 125ms linear 0s,top 175ms ease-out,left 175ms ease-out,right 175ms ease-out',
    }),
    [height, style, width, xAxis, yAxis],
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
      data-is-dragging={isDragging}
      data-can-edit={canEdit}
      draggable={canEdit}
      style={mergedStyle}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    />
  )
}

export const InternalItem = memo(InternalItemComponent)
