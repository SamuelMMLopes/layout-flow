import { Item } from './item'
import { NumberUtils } from '@/utils'

export class Layout {
  private readonly lastFilledColumn: number
  private readonly lastFilledRow: number

  private constructor(
    readonly sliceHeight: number,
    readonly sliceWidth: number,
    readonly gap: number,
    readonly minTotalColumns: number,
    readonly minTotalRows: number,
    readonly availableWidth: number,
    readonly isTotalColumnsFixed: boolean,
    readonly items: Item[],
  ) {
    const lastFilled = this.items.reduce(
      (lastFilled, item) => {
        if (item.endColumn > lastFilled.column) {
          lastFilled.column = item.endColumn
        }
        if (item.endRow > lastFilled.row) {
          lastFilled.row = item.endRow
        }
        return lastFilled
      },
      { column: 0, row: 0 },
    )
    this.lastFilledColumn = lastFilled.column
    this.lastFilledRow = lastFilled.row
    Object.freeze(this)
  }

  get totalColumns(): number {
    if (this.isTotalColumnsFixed) return this.minTotalColumns
    return Math.max(this.lastFilledColumn + 3, this.minTotalColumns)
  }

  get totalRows(): number {
    return Math.max(this.lastFilledRow + 3, this.minTotalRows)
  }

  calculateHeight(): number {
    return (this.sliceHeight + this.gap) * this.totalRows
  }

  calculateWidth(): number {
    return (this.sliceWidth + this.gap) * this.totalColumns
  }

  availableSlice({ filledColumns, filledRows }: Layout.AvailableSliceInput): Layout.AvailableSliceOutput {
    const visibleColumns = Math.floor(this.availableWidth / this.sliceWidth)
    let startRow = 1
    while (true) {
      for (let actualColumn = 1; actualColumn <= visibleColumns; actualColumn++) {
        const itemToCompare = Item.create({
          id: 'temp-id',
          startColumn: actualColumn,
          startRow,
          filledColumns,
          filledRows,
        })
        if (this.items.every((item) => !item.hasCollision(itemToCompare)))
          return { startColumn: actualColumn, startRow }
      }
      startRow++
    }
  }

  addItem({ startColumn, startRow, ...item }: Layout.RawItem): Layout {
    const previouslyAddedItem = this.items.find((current) => current.id === item.id) !== undefined
    if (previouslyAddedItem) return this
    if (startColumn !== undefined && startRow !== undefined) {
      return new Layout(
        this.sliceHeight,
        this.sliceWidth,
        this.gap,
        this.minTotalColumns,
        this.minTotalRows,
        this.availableWidth,
        this.isTotalColumnsFixed,
        [...this.items, Item.create({ ...item, startColumn, startRow })],
      )
    }
    const { startColumn: nextStartColumn, startRow: nextStartRow } = this.availableSlice({
      filledColumns: item.filledColumns,
      filledRows: item.filledRows,
    })
    return new Layout(
      this.sliceHeight,
      this.sliceWidth,
      this.gap,
      this.minTotalColumns,
      this.minTotalRows,
      this.availableWidth,
      this.isTotalColumnsFixed,
      [...this.items, Item.create({ startColumn: nextStartColumn, startRow: nextStartRow, ...item })],
    )
  }

  removeItem(itemIdToRemove: string): Layout {
    const itemsWithoutItemToBeRemoved = this.items.filter((item) => item.id !== itemIdToRemove)
    return new Layout(
      this.sliceHeight,
      this.sliceWidth,
      this.gap,
      this.minTotalColumns,
      this.minTotalRows,
      this.availableWidth,
      this.isTotalColumnsFixed,
      itemsWithoutItemToBeRemoved,
    )
  }

  resolveCollisions({ itemChanged, collisions }: Layout.ResolveCollisionsInput): Layout {
    return collisions.reduce<Layout>((layout, collision) => {
      const startRowToMoveUp = itemChanged.startRow - collision.filledRows
      const canMoveUp =
        startRowToMoveUp <= 0
          ? false
          : layout.items.filter((item) => item.hasCollision(Item.create({ ...collision, startRow: startRowToMoveUp })))
              .length === 0
      if (canMoveUp) {
        return layout.moveItem({
          itemToMove: collision,
          columnsToMove: 0,
          rowsToMove: startRowToMoveUp - collision.startRow,
        })
      }
      const startColumToMoveLeft = itemChanged.startColumn - collision.filledColumns
      const canMoveLeft =
        startColumToMoveLeft <= 0
          ? false
          : layout.items.filter((item) =>
              item.hasCollision(Item.create({ ...collision, startColumn: startColumToMoveLeft })),
            ).length === 0
      if (canMoveLeft) {
        return layout.moveItem({
          itemToMove: collision,
          columnsToMove: startColumToMoveLeft - collision.startColumn,
          rowsToMove: 0,
        })
      }
      const startColumToMoveRight = itemChanged.startColumn + collision.filledColumns
      const canMoveRight =
        startColumToMoveRight <= 0
          ? false
          : layout.items.filter((item) =>
              item.hasCollision(Item.create({ ...collision, startColumn: startColumToMoveRight })),
            ).length === 0
      if (canMoveRight) {
        return layout.moveItem({
          itemToMove: collision,
          columnsToMove: startColumToMoveRight - collision.startColumn,
          rowsToMove: 0,
        })
      }
      const startRowToMoveDown = itemChanged.startRow + collision.filledRows
      const canMoveDown =
        startRowToMoveDown <= 0
          ? false
          : layout.items.filter((item) =>
              item.hasCollision(Item.create({ ...collision, startRow: startRowToMoveDown })),
            ).length === 0
      if (canMoveDown) {
        return layout.moveItem({
          itemToMove: collision,
          columnsToMove: 0,
          rowsToMove: startRowToMoveDown - collision.startRow,
        })
      }
      return layout
    }, this)
  }

  resizeItem({ itemToResize, filledColumns, filledRows }: Layout.ResizeItemInput): Layout {
    const itemResized = Item.create({ ...itemToResize, filledColumns, filledRows })
    const collisions = this.items.filter((item) => item.hasCollision(itemResized))
    if (collisions.length > 0) return this
    const itemsWithoutItemToResize = this.items.filter((item) => item.id !== itemToResize.id)
    return new Layout(
      this.sliceHeight,
      this.sliceWidth,
      this.gap,
      this.minTotalColumns,
      this.minTotalRows,
      this.availableWidth,
      this.isTotalColumnsFixed,
      [...itemsWithoutItemToResize, itemResized],
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

  moveItem({ itemToMove, columnsToMove, rowsToMove }: Layout.MoveItemInput): Layout {
    const newStartColumn = itemToMove.startColumn + columnsToMove
    const newStartRow = itemToMove.startRow + rowsToMove
    if (newStartColumn < 1 || newStartRow < 1) return this
    const itemMoved = Item.create({ ...itemToMove, startColumn: newStartColumn, startRow: newStartRow })
    const collisions = this.items.filter((item) => item.hasCollision(itemMoved))
    if (collisions.length > 0) return this
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

  private static sortByItemsWithFilledPosition(rawItems: Layout.RawItem[]): Layout.RawItem[] {
    return rawItems.toSorted((firstRawItem, secondRawItem) => {
      if (firstRawItem.startColumn === undefined || firstRawItem.startRow === undefined) return 1
      if (secondRawItem.startColumn === undefined || secondRawItem.startRow === undefined) return -1
      return 0
    })
  }

  static create({
    sliceHeight,
    sliceWidth,
    gap,
    totalColumns,
    totalRows,
    availableWidth,
    items = [],
  }: Layout.CreateInput): Layout {
    const isDefinedSliceWidth = sliceWidth !== undefined && sliceWidth !== null
    if (
      !NumberUtils.isGreaterThanZeroMultiple(sliceHeight, gap, totalColumns, totalRows, availableWidth) &&
      isDefinedSliceWidth &&
      !NumberUtils.isGreaterThanZero(sliceWidth)
    ) {
      throw new Error('Invalid create layout input')
    }
    const calculatedSliceWidth = isDefinedSliceWidth ? sliceWidth : (availableWidth - totalColumns * gap) / totalColumns
    return this.sortByItemsWithFilledPosition(items).reduce(
      (layout, item) => layout.addItem(item),
      new Layout(
        sliceHeight,
        calculatedSliceWidth,
        gap,
        totalColumns,
        totalRows,
        availableWidth,
        !isDefinedSliceWidth,
        [],
      ),
    )
  }
}

export namespace Layout {
  export type AvailableSliceInput = {
    filledColumns: number
    filledRows: number
  }
  export type AvailableSliceOutput = {
    startColumn: number
    startRow: number
  }

  export type CalculateColumnsToMoveInput = {
    currentMouseXAxis: number
    lastMouseXAxis: number
    currentScrollXAxis: number
    lastScrollXAxis: number
  }

  export type ResolveCollisionsInput = {
    itemChanged: Item
    collisions: Item[]
  }

  export type ResizeItemInput = {
    itemToResize: Item
    filledColumns: number
    filledRows: number
  }

  export type MoveItemInput = {
    itemToMove: Item
    columnsToMove: number
    rowsToMove: number
  }

  export type CalculateRowsToMoveInput = {
    currentMouseYAxis: number
    lastMouseYAxis: number
    currentScrollYAxis: number
    lastScrollYAxis: number
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

  export type CreateInput = {
    sliceHeight: number
    sliceWidth?: number
    gap: number
    totalColumns: number
    totalRows: number
    availableWidth: number
    items?: RawItem[]
  }
}
