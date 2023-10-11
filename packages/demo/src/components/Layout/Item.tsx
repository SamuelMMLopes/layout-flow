import { type ComponentProps, type ReactNode } from 'react'

type ItemProps = ComponentProps<'div'> & {
  id: string
}

export function Item(props: ItemProps): ReactNode {
  return <div {...props} />
}
