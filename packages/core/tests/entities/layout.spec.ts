import { Layout } from '@/entities'

describe('Layout', () => {
  it('should be able to create a valid layout', () => {
    const rawLayout = {
      sliceHeight: 85,
      sliceWidth: 85,
      gap: 5,
      totalColumns: 10,
      totalRows: 10,
      availableWidth: 500,
      items: [
        {
          id: 'any_id',
          startColumn: 1,
          startRow: 1,
          filledColumns: 2,
          filledRows: 2,
        },
      ],
    }
    const layout = Layout.create(rawLayout)
    expect(layout.calculateHeight()).toBe(900)
    expect(layout.calculateWidth()).toBe(900)
    expect(layout.items).toHaveLength(1)
  })

  it.each([0, -1])(
    'should to throw Invalid layout slice height error if it is less than or equal to zero',
    (sliceHeight) => {
      const rawLayout = {
        sliceHeight,
        sliceWidth: 85,
        gap: 5,
        totalColumns: 10,
        totalRows: 10,
        availableWidth: 500,
      }
      expect(() => Layout.create(rawLayout)).toThrow(new Error('Invalid layout slice height'))
    },
  )

  it.each([0, -1])(
    'should to throw Invalid layout slice width error if it is less than or equal to zero',
    (sliceWidth) => {
      const rawLayout = {
        sliceHeight: 85,
        sliceWidth,
        gap: 5,
        totalColumns: 10,
        totalRows: 10,
        availableWidth: 500,
      }
      expect(() => Layout.create(rawLayout)).toThrow(new Error('Invalid layout slice width'))
    },
  )

  it.each([0, -1])('should to throw Invalid layout gap error if it is less than or equal to zero', (gap) => {
    const rawLayout = {
      sliceHeight: 85,
      sliceWidth: 85,
      gap,
      totalColumns: 10,
      totalRows: 10,
      availableWidth: 500,
    }
    expect(() => Layout.create(rawLayout)).toThrow(new Error('Invalid layout gap'))
  })

  it.each([0, -1])(
    'should to throw Invalid layout total columns error if it is less than or equal to zero',
    (totalColumns) => {
      const rawLayout = {
        sliceHeight: 85,
        sliceWidth: 85,
        gap: 5,
        totalColumns,
        totalRows: 10,
        availableWidth: 500,
      }
      expect(() => Layout.create(rawLayout)).toThrow(new Error('Invalid layout total columns'))
    },
  )

  it.each([0, -1])(
    'should to throw Invalid layout total rows error if it is less than or equal to zero',
    (totalRows) => {
      const rawLayout = {
        sliceHeight: 85,
        sliceWidth: 85,
        gap: 5,
        totalColumns: 10,
        totalRows,
        availableWidth: 500,
      }
      expect(() => Layout.create(rawLayout)).toThrow(new Error('Invalid layout total rows'))
    },
  )

  it.each([0, -1])(
    'should to throw Invalid layout available width error if it is less than or equal to zero',
    (availableWidth) => {
      const rawLayout = {
        sliceHeight: 85,
        sliceWidth: 85,
        gap: 5,
        totalColumns: 10,
        totalRows: 10,
        availableWidth,
      }
      expect(() => Layout.create(rawLayout)).toThrow(new Error('Invalid layout available width'))
    },
  )

  it('should be able to calculate sliceWidth if it is not informed', () => {
    const rawLayout = {
      sliceHeight: 85,
      gap: 5,
      totalColumns: 10,
      totalRows: 10,
      availableWidth: 1024,
    }
    const layout = Layout.create(rawLayout)
    expect(layout.calculateWidth()).toBe(1024)
  })

  it('should return a new layout with the added item', () => {
    const rawLayout = {
      sliceHeight: 85,
      sliceWidth: 85,
      gap: 5,
      totalColumns: 10,
      totalRows: 10,
      availableWidth: 500,
    }
    const layout = Layout.create(rawLayout)
    const rawItem = {
      id: 'any_id',
      startColumn: 1,
      startRow: 1,
      filledColumns: 2,
      filledRows: 2,
    }
    const layoutWithAddedItem = layout.addItem(rawItem)
    expect(layoutWithAddedItem.items).toHaveLength(1)
  })
})
