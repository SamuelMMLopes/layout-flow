import { NumberUtils } from '@/utils'
import { Occupancies } from './occupancies'
import { Item } from './item'

export class Layout {
  private readonly occupancies: Occupancies

  private constructor(
    readonly sliceHeight: number,
    readonly sliceWidth: number,
    readonly gap: number,
    readonly minTotalColumns: number,
    readonly minTotalRows: number,
    readonly availableWidth: number,
    private readonly isTotalColumnsFixed: boolean,
    readonly items: Item[],
  ) {
    this.occupancies = new Occupancies(this.items, this.sliceWidth)
    Object.freeze(this)
  }

  get totalColumns(): number {
    if (this.isTotalColumnsFixed) return this.minTotalColumns
    return Math.max(this.occupancies.lastFilledColumn + 3, this.minTotalColumns)
  }

  get totalRows(): number {
    return Math.max(this.occupancies.lastFilledRow + 3, this.minTotalRows)
  }

  calculateHeight(): number {
    return (this.sliceHeight + this.gap) * this.totalRows
  }

  calculateWidth(): number {
    return (this.sliceWidth + this.gap) * this.totalColumns
  }

  addItem({ startColumn, startRow, ...rawItem }: Layout.RawItem): Layout {
    const previouslyAddedItem = this.items.find((item) => item.id === rawItem.id) !== undefined
    if (previouslyAddedItem) return this
    if (startColumn && startRow) {
      return new Layout(
        this.sliceHeight,
        this.sliceWidth,
        this.gap,
        this.totalColumns,
        this.totalRows,
        this.availableWidth,
        this.isTotalColumnsFixed,
        [...this.items, Item.create({ startColumn, startRow, ...rawItem })],
      )
    }
    const { startColumn: nextStartColumn, startRow: nextStartRow } = this.occupancies.nextSlot({
      filledColumns: rawItem.filledColumns,
      filledRows: rawItem.filledRows,
      availableWidth: this.availableWidth,
    })
    return new Layout(
      this.sliceHeight,
      this.sliceWidth,
      this.gap,
      this.totalColumns,
      this.totalRows,
      this.availableWidth,
      this.isTotalColumnsFixed,
      [...this.items, Item.create({ startColumn: nextStartColumn, startRow: nextStartRow, ...rawItem })],
    )
  }

  calculateColumnsToMove({
    currentMouseXAxis,
    lastMouseXAxis,
    currentScrollXAxis,
    lastScrollXAxis,
  }: Layout.CalculateColumnsToMoveInput): number {
    const deltaXAxis = currentMouseXAxis - lastMouseXAxis
    const xAxisToMove = deltaXAxis + (currentScrollXAxis - lastScrollXAxis)
    return Math.round(xAxisToMove / (this.sliceWidth + this.gap))
  }

  calculateRowsToMove({
    currentMouseYAxis,
    lastMouseYAxis,
    currentScrollYAxis,
    lastScrollYAxis,
  }: Layout.CalculateRowsToMoveInput): number {
    const deltaYAxis = currentMouseYAxis - lastMouseYAxis
    const yAxisToMove = deltaYAxis + (currentScrollYAxis - lastScrollYAxis)
    return Math.round(yAxisToMove / (this.sliceHeight + this.gap))
  }

  private static sortByItemsWithFilledPosition(rawItems: Layout.RawItem[]): Layout.RawItem[] {
    return rawItems.toSorted((firstRawItem, secondRawItem) => {
      if (firstRawItem.startColumn === undefined || firstRawItem.startRow === undefined) return 1
      if (secondRawItem.startColumn === undefined || secondRawItem.startRow === undefined) return -1
      return 0
    })
  }

  resolveCollisions({ itemMoved, collisions }: Layout.ResolveCollisionsInput): Layout {
    return collisions.reduce<Layout>((layout, collision) => {
      const startRowToMoveUp = itemMoved.startRow - collision.filledRows
      const canMoveUp =
        startRowToMoveUp <= 0
          ? false
          : layout.items.filter((item) => item.hasCollision(Item.create({ ...collision, startRow: startRowToMoveUp })))
              .length === 0
      if (canMoveUp) {
        console.log(startRowToMoveUp)
        return layout.moveItem({
          itemToMove: collision,
          columnsToMove: 0,
          rowsToMove: startRowToMoveUp,
        })
      }
      return layout
    }, this)
  }

  moveItem({ itemToMove, columnsToMove, rowsToMove }: Layout.MoveItemInput): Layout {
    const newStartColumn = itemToMove.startColumn + columnsToMove
    const newStartRow = itemToMove.startRow + rowsToMove
    const isOutsideArea = newStartColumn < 1 || newStartRow < 1
    if (isOutsideArea) return this
    const itemMoved = Item.create({ ...itemToMove, startColumn: newStartColumn, startRow: newStartRow })
    const collisions = this.items.filter((item) => item.hasCollision(itemMoved))
    if (collisions.length > 0) return this.resolveCollisions({ itemMoved, collisions })
    const itemsWithoutItemToMove = this.items.filter((item) => item.id !== itemToMove.id)
    return new Layout(
      this.sliceHeight,
      this.sliceWidth,
      this.gap,
      this.minTotalColumns,
      this.minTotalRows,
      this.availableWidth,
      this.isTotalColumnsFixed,
      [...itemsWithoutItemToMove, itemMoved],
    )
  }

  resizeItem({ itemToResize, filledColumns, filledRows }: Layout.ResizeItemInput): Layout {
    return this
  }

  static create({
    sliceHeight,
    sliceWidth,
    gap,
    totalColumns,
    totalRows,
    availableWidth,
    items: rawItems = [],
  }: Layout.CreateInput): Layout {
    if (!NumberUtils.isGreaterThanZero(sliceHeight)) throw new Error('Invalid layout slice height')
    if (sliceWidth !== undefined && sliceWidth !== null && !NumberUtils.isGreaterThanZero(sliceWidth)) {
      throw new Error('Invalid layout slice width')
    }
    if (!NumberUtils.isGreaterThanZero(gap)) throw new Error('Invalid layout gap')
    if (!NumberUtils.isGreaterThanZero(totalColumns)) throw new Error('Invalid layout total columns')
    if (!NumberUtils.isGreaterThanZero(totalRows)) throw new Error('Invalid layout total rows')
    if (!NumberUtils.isGreaterThanZero(availableWidth)) throw new Error('Invalid layout available width')
    const sortedRawItems = Layout.sortByItemsWithFilledPosition(rawItems)
    if (sliceWidth !== undefined && sliceWidth !== null) {
      return sortedRawItems.reduce(
        (layout, rawItem) => layout.addItem(rawItem),
        new Layout(sliceHeight, sliceWidth, gap, totalColumns, totalRows, availableWidth, true, []),
      )
    }
    const calculatedSliceWidth = (availableWidth - totalColumns * gap) / totalColumns
    return sortedRawItems.reduce(
      (layout, rawItem) => layout.addItem(rawItem),
      new Layout(sliceHeight, calculatedSliceWidth, gap, totalColumns, totalRows, availableWidth, true, []),
    )
  }
}

export namespace Layout {
  export type CreateInput = {
    sliceHeight: number
    sliceWidth?: number
    gap: number
    totalColumns: number
    totalRows: number
    availableWidth: number
    items?: Layout.RawItem[]
  }

  export type RawItem = {
    id: string
    isFixed?: boolean
    startColumn?: number
    startRow?: number
    filledColumns: number
    filledRows: number
    minFilledColumns?: number
    minFilledRows?: number
    maxFilledColumns?: number
    maxFilledRows?: number
  }

  export type CalculateColumnsToMoveInput = {
    currentMouseXAxis: number
    lastMouseXAxis: number
    currentScrollXAxis: number
    lastScrollXAxis: number
  }

  export type CalculateRowsToMoveInput = {
    currentMouseYAxis: number
    lastMouseYAxis: number
    currentScrollYAxis: number
    lastScrollYAxis: number
  }

  export type ResolveCollisionsInput = {
    itemMoved: Item
    collisions: Item[]
  }

  export type MoveItemInput = {
    itemToMove: Item
    columnsToMove: number
    rowsToMove: number
  }

  export type ResizeItemInput = {
    itemToResize: Item
    filledColumns: number
    filledRows: number
  }
}
