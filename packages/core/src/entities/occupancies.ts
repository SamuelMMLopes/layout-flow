import { Item } from './item'

export class Occupancies {
  readonly lastFilledColumn: number
  readonly lastFilledRow: number

  constructor(
    private readonly items: Item[],
    private readonly sliceWidth: number,
  ) {
    const lastFilledSlot = this.lastFilledSlot()
    this.lastFilledColumn = lastFilledSlot.column
    this.lastFilledRow = lastFilledSlot.row
    Object.freeze(this)
  }

  private lastFilledSlot(): Occupancies.LastFilledSlotOutput {
    return this.items.reduce(
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
  }

  nextSlot({ availableWidth, filledColumns, filledRows }: Occupancies.NextSlotInput): Occupancies.NextSlotOutput {
    const visibleColumns = Math.floor(availableWidth / this.sliceWidth)
    let startRow = 1
    while (true) {
      for (let actualColumn = 1; actualColumn <= visibleColumns; actualColumn++) {
        const itemToCompare = Item.create({
          id: 'fake-id',
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
}

export namespace Occupancies {
  export type LastFilledSlotOutput = { column: number; row: number }

  export type NextSlotInput = {
    availableWidth: number
    filledColumns: number
    filledRows: number
  }

  export type NextSlotOutput = { startColumn: number; startRow: number }
}
