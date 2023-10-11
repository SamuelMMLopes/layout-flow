'use client'
import { Layout, Item } from '@layout-flow/core'
import { createContext } from 'use-context-selector'
import { MouseEvent, ReactNode, RefObject, useCallback, useEffect, useRef, useState } from 'react'

type onDragStartInput = {
  item: Item
  event: MouseEvent
}

type LayoutContextType = {
  layout: Layout
  isEditing: boolean
  isDragging: boolean
  canEdit: boolean
  viewportRef: RefObject<HTMLDivElement>
  onDragStart: (input: onDragStartInput) => void
  onDrag: (event: MouseEvent) => void
  onDragEnd: (event: MouseEvent) => void
}

export const LayoutContext = createContext({} as LayoutContextType)

type RawLayout = Layout.CreateInput & {
  canEdit: boolean
}

type LayoutProviderProps = {
  layout: RawLayout
  children: ReactNode
}

export function LayoutProvider({ layout: rawLayout, children }: LayoutProviderProps) {
  const [layout, setLayout] = useState(Layout.create(rawLayout))
  const [isEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const lastMouseAxes = useRef<{xAxis: number; yAxis: number}| null>(null)
  const lastScrollAxes = useRef<{xAxis: number; yAxis: number}| null>(null)
  const itemBeingDragged = useRef<Item | null>(null)

  useEffect(() => {
    setLayout(Layout.create(rawLayout))
  }, [rawLayout])

  const onDragStart = useCallback(
    ({ item, event }: onDragStartInput) => {
      if (viewportRef.current === null) throw new Error('Viewport not found')
      if (!rawLayout.canEdit) return
      event.stopPropagation()
      itemBeingDragged.current = item
      lastMouseAxes.current = {
        xAxis: event.clientX,
        yAxis: event.clientY,
      }
      lastScrollAxes.current = {
        xAxis: viewportRef.current.scrollLeft,
        yAxis: viewportRef.current.scrollTop,
      }
    },
    [rawLayout.canEdit],
  )

  const canDrag = useCallback(() => {
    return (
      rawLayout.canEdit &&
      itemBeingDragged.current !== null &&
      lastMouseAxes.current !== null &&
      lastScrollAxes.current !== null
    )
  }, [rawLayout.canEdit])

  const onDrag = useCallback(
    (event: MouseEvent) => {
      if (!canDrag()) return
      setIsDragging(true)
      const currentMouseAxes = {
        xAxis: event.clientX,
        yAxis: event.clientY,
      }
      const currentScrollAxes = {
        xAxis: viewportRef.current?.scrollLeft as number,
        yAxis: viewportRef.current?.scrollTop as number,
      }
      const columnsToMove = layout.calculateColumnsToMove({
        currentMouseXAxis: event.clientX,
        currentScrollXAxis: viewportRef.current?.scrollLeft as number,
        lastMouseXAxis: lastMouseAxes.current?.xAxis as number,
        lastScrollXAxis: lastScrollAxes.current?.xAxis as number
      })
      const rowsToMove = layout.calculateRowsToMove({
        currentMouseYAxis: event.clientY,
        currentScrollYAxis: viewportRef.current?.scrollTop as number,
        lastMouseYAxis: lastMouseAxes.current?.yAxis as number,
        lastScrollYAxis: lastScrollAxes.current?.yAxis as number
      })
      const newLayout = layout.moveItem({
        itemToMove: itemBeingDragged.current as Item,
        columnsToMove,
        rowsToMove
      })
      console.log(newLayout)
      if (newLayout !== layout) setLayout(newLayout)
    },
    [canDrag, layout],
  )

  const onDragEnd = useCallback(
    (event: MouseEvent) => {
      if (!rawLayout.canEdit) return
      event.stopPropagation()
      setIsDragging(false)
      itemBeingDragged.current = null
      lastMouseAxes.current = null
      lastScrollAxes.current = null
    },
    [rawLayout.canEdit],
  )

  return (
    <LayoutContext.Provider
      value={{ layout, isEditing, isDragging, canEdit: rawLayout.canEdit, viewportRef, onDragStart, onDrag, onDragEnd }}
    >
      {children}
    </LayoutContext.Provider>
  )
}
