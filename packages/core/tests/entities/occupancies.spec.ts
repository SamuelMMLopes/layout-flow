import { Item, Occupancies } from '@/entities'

describe('Occupancies', () => {
  it('should return the next closest available slot', () => {
    const items = [
      Item.create({ id: 'any_id', startColumn: 1, startRow: 1, filledColumns: 2, filledRows: 2 }),
      Item.create({ id: 'any_id_2', startColumn: 3, startRow: 1, filledColumns: 4, filledRows: 2 }),
    ]
    const occupancies = new Occupancies(items, 85)
    const { startColumn, startRow } = occupancies.nextSlot({ filledColumns: 2, filledRows: 2, availableWidth: 500 })
    expect(startColumn).toBe(1)
    expect(startRow).toBe(3)
  })
})
