'use client'
import { LayoutContext } from './LayoutContext'
import { InternalItem } from './InternalItem'

import { type CSSProperties, useMemo, type ComponentProps, type ReactNode, Children, type ReactElement } from 'react'
import { useContextSelector } from 'use-context-selector'

type AreaProps = ComponentProps<'div'> & {
  children: ReactElement | ReactElement[]
}

export function Area({ style, ...props }: AreaProps): ReactNode {
  const layout = useContextSelector(LayoutContext, (context) => context.layout)
  const canEdit = useContextSelector(LayoutContext, (context) => context.canEdit)
  const isDragging = useContextSelector(LayoutContext, (context) => context.isDragging)
  const onDrag = useContextSelector(LayoutContext, (context) => context.onDrag)
  const mergedStyle: CSSProperties = useMemo(
    () => ({
      ...style,
      position: 'relative',
      height: `${layout.calculateHeight()}px`,
      width: `${layout.calculateWidth()}px`,
    }),
    [layout, style],
  )

  const children = useMemo(() => {
    return Children.map(props.children, (child) => {
      const item = layout.items.find((item) => item.id === child.props.id)
      if (item === undefined) return null
      return (
        <InternalItem
          {...child.props}
          item={item}
          sliceHeight={layout.sliceHeight}
          sliceWidth={layout.sliceWidth}
          gap={layout.gap}
        />
      )
    })
  }, [layout.gap, layout.items, layout.sliceHeight, layout.sliceWidth, props.children])

  return (
    <div {...props} style={mergedStyle} data-can-edit={canEdit} data-is-dragging={isDragging} onDragOver={onDrag}>
      {children}
    </div>
  )
}
