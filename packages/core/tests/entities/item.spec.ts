import { Item } from '@/entities'

describe('Item', () => {
  it('should be able to create a valid item', () => {
    const rawItem = {
      id: 'any_id',
      startColumn: 1,
      startRow: 1,
      filledColumns: 2,
      filledRows: 2,
    }
    const item = Item.create(rawItem)
    expect(item.calculateHeight({ sliceHeight: 85, gap: 5 })).toBe(175)
    expect(item.calculateWidth({ sliceWidth: 85, gap: 5 })).toBe(175)
    expect(item.calculateXAxis({ sliceWidth: 85, gap: 5 })).toBe(0)
    expect(item.calculateYAxis({ sliceHeight: 85, gap: 5 })).toBe(0)
  })

  it('should return true if has collision', () => {
    const item = Item.create({
      id: 'any_id',
      startColumn: 1,
      startRow: 1,
      filledColumns: 2,
      filledRows: 2,
    })
    const itemToCompare = Item.create({
      id: 'any_id_2',
      startColumn: 2,
      startRow: 1,
      filledColumns: 2,
      filledRows: 2,
    })
    expect(item.hasCollision(itemToCompare)).toBeTruthy()
  })

  it('should return false if no has collision', () => {
    const item = Item.create({
      id: 'any_id',
      startColumn: 1,
      startRow: 1,
      filledColumns: 2,
      filledRows: 2,
    })
    const itemToCompare = Item.create({
      id: 'any_id_2',
      startColumn: 2,
      startRow: 4,
      filledColumns: 2,
      filledRows: 2,
    })
    expect(item.hasCollision(itemToCompare)).toBeFalsy()
  })

  it.each([undefined, null])(
    'should to throw Invalid item id error if the id of the item entered is different from a string',
    (id: unknown) => {
      const rawItem = {
        id: id as string,
        startColumn: 1,
        startRow: 1,
        filledColumns: 2,
        filledRows: 2,
      }
      expect(() => Item.create(rawItem)).toThrow(new Error('Invalid item id'))
    },
  )

  it.each([0, -1])(
    'should to throw Invalid item start column error if it is less than or equal to zero',
    (startColumn) => {
      const rawItem = {
        id: 'any_id',
        startColumn,
        startRow: 1,
        filledColumns: 2,
        filledRows: 2,
      }
      expect(() => Item.create(rawItem)).toThrow(new Error('Invalid item start column'))
    },
  )

  it.each([0, -1])('should to throw Invalid item start row error if it is less than or equal to zero', (startRow) => {
    const rawItem = {
      id: 'any_id',
      startColumn: 1,
      startRow,
      filledColumns: 2,
      filledRows: 2,
    }
    expect(() => Item.create(rawItem)).toThrow(new Error('Invalid item start row'))
  })

  it.each([0, -1])(
    'should to throw Invalid item filled columns error if it is less than or equal to zero',
    (filledColumns) => {
      const rawItem = {
        id: 'any_id',
        startColumn: 1,
        startRow: 1,
        filledColumns,
        filledRows: 2,
      }
      expect(() => Item.create(rawItem)).toThrow(new Error('Invalid item filled columns'))
    },
  )

  it.each([0, -1])(
    'should to throw Invalid item filled rows error if it is less than or equal to zero',
    (filledRows) => {
      const rawItem = {
        id: 'any_id',
        startColumn: 1,
        startRow: 1,
        filledColumns: 2,
        filledRows,
      }
      expect(() => Item.create(rawItem)).toThrow(new Error('Invalid item filled rows'))
    },
  )

  it.each([0, -1])(
    'should to throw Invalid item min filled columns error if it is less than or equal to zero',
    (minFilledColumns) => {
      const rawItem = {
        id: 'any_id',
        startColumn: 1,
        startRow: 1,
        filledColumns: 2,
        filledRows: 2,
        minFilledColumns,
      }
      expect(() => Item.create(rawItem)).toThrow(new Error('Invalid item min filled columns'))
    },
  )

  it.each([0, -1])(
    'should to throw Invalid item min filled rows error if it is less than or equal to zero',
    (minFilledRows) => {
      const rawItem = {
        id: 'any_id',
        startColumn: 1,
        startRow: 1,
        filledColumns: 2,
        filledRows: 2,
        minFilledRows,
      }
      expect(() => Item.create(rawItem)).toThrow(new Error('Invalid item min filled rows'))
    },
  )

  it.each([0, -1])(
    'should to throw Invalid item max filled columns error if it is less than or equal to zero',
    (maxFilledColumns) => {
      const rawItem = {
        id: 'any_id',
        startColumn: 1,
        startRow: 1,
        filledColumns: 2,
        filledRows: 2,
        maxFilledColumns,
      }
      expect(() => Item.create(rawItem)).toThrow(new Error('Invalid item max filled columns'))
    },
  )

  it.each([0, -1])(
    'should to throw Invalid item max filled rows error if it is less than or equal to zero',
    (maxFilledRows) => {
      const rawItem = {
        id: 'any_id',
        startColumn: 1,
        startRow: 1,
        filledColumns: 2,
        filledRows: 2,
        maxFilledRows,
      }
      expect(() => Item.create(rawItem)).toThrow(new Error('Invalid item max filled rows'))
    },
  )
})
