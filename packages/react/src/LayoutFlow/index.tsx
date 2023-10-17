'use client'
import { InternalItem } from './InternalItem'
import { useControllableState } from '@/utils'

import { type Layout, type Item } from '@layout-flow/core'
import {
  type ReactNode,
  type MouseEvent,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  useMemo,
  useState,
  Children,
  type ReactElement,
  useCallback,
} from 'react'

export type OnDragStartInput = {
  event: MouseEvent
  item: Item
}

type LayoutFlowProps = ComponentPropsWithoutRef<'div'> & {
  layout: Layout
  onLayoutChange?: (layout: Layout) => void
  canEdit?: boolean
  children: ReactElement | ReactElement[]
}

export function LayoutFlow({
  layout: initialLayout,
  onLayoutChange,
  canEdit = true,
  style,
  children,
  ...props
}: LayoutFlowProps): ReactNode {
  const [layout, setLayout] = useControllableState<Layout>({
    prop: initialLayout,
    onChange: onLayoutChange,
  })
  const [isDragging, setIsDragging] = useState(false)

  const ref = useRef<HTMLDivElement | null>(null)
  const itemBeingDragged = useRef<Item | null>(null)
  const lastMouseXAxis = useRef<number | null>(null)
  const lastMouseYAxis = useRef<number | null>(null)
  const lastScrollXAxis = useRef<number | null>(null)
  const lastScrollYAxis = useRef<number | null>(null)

  const onDragStart = useCallback(
    ({ item, event }: OnDragStartInput) => {
      if (!canEdit) return
      event.stopPropagation()
      setIsDragging(true)
      itemBeingDragged.current = item
      lastMouseXAxis.current = event.clientX
      lastMouseYAxis.current = event.clientY
      lastScrollXAxis.current = ref.current?.parentElement?.scrollLeft ?? null
      lastScrollYAxis.current = ref.current?.parentElement?.scrollTop ?? null
    },
    [canEdit],
  )

  const canDrag = useCallback(() => {
    return (
      canEdit &&
      ref.current?.parentElement !== null &&
      itemBeingDragged.current !== null &&
      lastMouseXAxis.current !== null &&
      lastMouseYAxis.current !== null &&
      lastScrollXAxis.current !== null &&
      lastScrollYAxis.current !== null
    )
  }, [canEdit])

  const onDrag = useCallback(
    (event: MouseEvent) => {
      if (!canDrag()) return
      event.stopPropagation()
      const currentMouseXAxis = event.clientX
      const currentMouseYAxis = event.clientY
      const currentScrollXAxis = ref.current?.parentElement?.scrollLeft as number
      const currentScrollYAxis = ref.current?.parentElement?.scrollTop as number
      const columnsToMove = layout.calculateColumnsToMove({
        currentMouseXAxis,
        lastMouseXAxis: lastMouseXAxis.current as number,
        currentScrollXAxis,
        lastScrollXAxis: lastScrollXAxis.current as number,
      })
      const rowsToMove = layout.calculateRowsToMove({
        currentMouseYAxis,
        lastMouseYAxis: lastMouseYAxis.current as number,
        currentScrollYAxis,
        lastScrollYAxis: lastScrollYAxis.current as number,
      })
      setLayout(
        layout.moveItem({
          itemToMove: itemBeingDragged.current as Item,
          columnsToMove,
          rowsToMove,
        }),
      )
    },
    [canDrag, layout, setLayout],
  )

  const onDragEnd = useCallback(
    (event: MouseEvent) => {
      if (!canEdit) return
      event.stopPropagation()
      setIsDragging(false)
      itemBeingDragged.current = null
      lastMouseXAxis.current = null
      lastMouseYAxis.current = null
      lastScrollXAxis.current = null
      lastScrollYAxis.current = null
    },
    [canEdit],
  )

  const mergedStyle: CSSProperties = useMemo(
    () => ({
      ...style,
      height: `${layout.calculateHeight()}px`,
      width: `${layout.calculateWidth()}px`,
      position: 'relative',
    }),
    [layout, style],
  )

  const elements = useMemo(() => {
    return Children.map(children, (child) => {
      const item = layout.items.find((currentItem) => currentItem.id === child.key)
      if (item === undefined) return null
      return (
        <InternalItem
          {...child.props}
          canEdit={canEdit}
          item={item}
          sliceHeight={layout.sliceHeight}
          sliceWidth={layout.sliceWidth}
          gap={layout.gap}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      )
    })
  }, [canEdit, children, layout.gap, layout.items, layout.sliceHeight, layout.sliceWidth, onDragEnd, onDragStart])

  return (
    <div {...props} data-is-dragging={isDragging} ref={ref} style={mergedStyle} onDragOver={onDrag}>
      {elements}
    </div>
  )
}
