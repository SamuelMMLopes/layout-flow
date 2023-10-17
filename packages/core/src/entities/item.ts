import { NumberUtils } from '@/utils'

export class Item {
  private constructor(
    readonly id: string,
    readonly isFixed: boolean,
    readonly startColumn: number,
    readonly endColumn: number,
    readonly startRow: number,
    readonly endRow: number,
    readonly filledColumns: number,
    readonly filledRows: number,
    readonly minFilledColumns: number,
    readonly minFilledRows: number,
    readonly maxFilledColumns: number,
    readonly maxFilledRows: number,
  ) {
    Object.freeze(this)
  }

  calculateHeight({ sliceHeight, gap }: Item.CalculateHeightInput): number {
    const sliceHeightWithGap = sliceHeight + gap
    const height = this.filledRows * sliceHeightWithGap
    return height - gap
  }

  calculateWidth({ sliceWidth, gap }: Item.CalculateWidthInput): number {
    const sliceWidthWithGap = sliceWidth + gap
    const width = this.filledColumns * sliceWidthWithGap
    return width - gap
  }

  calculateXAxis({ sliceWidth, gap }: Item.CalculateXAxisInput): number {
    const sliceWidthWithGap = sliceWidth + gap
    return (this.startColumn - 1) * sliceWidthWithGap
  }

  calculateYAxis({ sliceHeight, gap }: Item.CalculateYAxisInput): number {
    const sliceHeightWithGap = sliceHeight + gap
    return (this.startRow - 1) * sliceHeightWithGap
  }

  hasCollision(itemToCompare: Item): boolean {
    if (itemToCompare.id === this.id) return false
    return (
      this.startColumn <= itemToCompare.endColumn &&
      itemToCompare.startColumn <= this.endColumn &&
      this.startRow <= itemToCompare.endRow &&
      itemToCompare.startRow <= this.endRow
    )
  }

  static create({
    id,
    isFixed = false,
    startColumn,
    startRow,
    filledColumns,
    filledRows,
    minFilledColumns = 1,
    minFilledRows = 1,
    maxFilledColumns = Infinity,
    maxFilledRows = Infinity,
  }: Item.CreateInput): Item {
    if (
      !NumberUtils.isGreaterThanZeroMultiple(
        startColumn,
        startRow,
        filledColumns,
        filledRows,
        minFilledColumns,
        minFilledRows,
        maxFilledColumns,
        maxFilledRows,
      )
    ) {
      throw new Error('Invalid create input')
    }
    const endColumn = startColumn + filledColumns - 1
    const endRow = startRow + filledRows - 1
    return new Item(
      id,
      isFixed,
      startColumn,
      endColumn,
      startRow,
      endRow,
      filledColumns,
      filledRows,
      minFilledColumns,
      minFilledRows,
      maxFilledColumns,
      maxFilledRows,
    )
  }
}

export namespace Item {
  export type CalculateHeightInput = {
    sliceHeight: number
    gap: number
  }

  export type CalculateWidthInput = {
    sliceWidth: number
    gap: number
  }

  export type CalculateXAxisInput = {
    sliceWidth: number
    gap: number
  }

  export type CalculateYAxisInput = {
    sliceHeight: number
    gap: number
  }

  export type CreateInput = {
    id: string
    isFixed?: boolean
    startColumn: number
    startRow: number
    filledColumns: number
    filledRows: number
    minFilledColumns?: number
    minFilledRows?: number
    maxFilledColumns?: number
    maxFilledRows?: number
  }
}
