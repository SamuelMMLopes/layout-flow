import { Item } from './item'
import { NumberUtils } from '@/utils'

export class Layout<ItemMetadata = any | undefined> {
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
    readonly allowsToGrowInWidth: boolean,
    readonly items: Array<Item<ItemMetadata>>,
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

  changeAvailableWidth(newAvailableWidth: number): Layout {
    if (!NumberUtils.isGreaterThanZero(newAvailableWidth)) {
      throw new Error('Invalid change available width input')
    }
    const calculatedSliceWidth = this.allowsToGrowInWidth
      ? this.sliceWidth
      : (newAvailableWidth - this.totalColumns * this.gap) / this.totalColumns
    return new Layout(
      this.sliceHeight,
      calculatedSliceWidth,
      this.gap,
      this.minTotalColumns,
      this.minTotalRows,
      newAvailableWidth,
      this.isTotalColumnsFixed,
      this.allowsToGrowInWidth,
      this.items,
    )
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
        this.allowsToGrowInWidth,
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
      this.allowsToGrowInWidth,
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
      this.allowsToGrowInWidth,
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

  resizeItem({ itemId, filledColumns, filledRows }: Layout.ResizeItemInput): Layout {
    const itemToResize = this.items.find((item) => item.id === itemId)
    if (itemToResize === undefined) return this
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
      this.allowsToGrowInWidth,
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

  private isAwayTheLayout({ startColumn, startRow, filledColumns }: Layout.IsAwayTheGridInput): boolean {
    if (startColumn < 1 || startRow < 1) return true
    if (!this.isTotalColumnsFixed) return false
    const endColumn = startColumn + filledColumns - 1
    return endColumn > this.minTotalColumns
  }

  moveItem({ itemToMove, columnsToMove, rowsToMove }: Layout.MoveItemInput): Layout {
    const newStartColumn = itemToMove.startColumn + columnsToMove
    const newStartRow = itemToMove.startRow + rowsToMove
    if (
      this.isAwayTheLayout({
        startColumn: newStartColumn,
        startRow: newStartRow,
        filledColumns: itemToMove.filledColumns,
      })
    ) {
      return this
    }
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
      this.allowsToGrowInWidth,
      [...itemsWithoutItemToMove, itemMoved],
    )
  }

  fillEmptySlicesWithPlaceholder(metadata?: ItemMetadata): Layout {
    const placeholderItems: Item[] = []
    for (let row = 1; row <= this.lastFilledRow; row++) {
      for (let column = 1; column <= this.lastFilledColumn; column++) {
        const placeholderItem = Item.create({
          id: `${Date.now()}${Math.random()}`,
          startColumn: column,
          startRow: row,
          filledColumns: 1,
          filledRows: 1,
          metadata,
        })
        const isNonEmpty = this.items.some((item) => item.hasCollision(placeholderItem))
        if (isNonEmpty) continue
        placeholderItems.push(placeholderItem)
      }
    }
    return new Layout(
      this.sliceHeight,
      this.sliceWidth,
      this.gap,
      this.minTotalColumns,
      this.minTotalRows,
      this.availableWidth,
      this.isTotalColumnsFixed,
      this.allowsToGrowInWidth,
      [...this.items, ...placeholderItems],
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
        isDefinedSliceWidth,
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
    itemId: string
    filledColumns: number
    filledRows: number
  }

  export type IsAwayTheGridInput = {
    startColumn: number
    startRow: number
    filledColumns: number
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

  export type RawItem<Metadata = any | undefined> = {
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
    metadata?: Metadata
  }

  export type FillEmptySlicesWithPlaceholderInput = {
    placeholderItemId: string
    metadata: any
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
