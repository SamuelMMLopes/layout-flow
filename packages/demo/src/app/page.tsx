'use client'
import { LayoutFlow, Layout } from '@layout-flow/react'
import { useEffect, useState } from 'react'

const rawLayout = {
  id: 'any_id',
  canEdit: true,
  sliceHeight: 85,
  sliceWidth: 85,
  gap: 5,
  totalColumns: 10,
  totalRows: 10,
  availableWidth: 2000,
  items: [
    {
      id: '1',
      filledColumns: 2,
      filledRows: 2
    },
    {
      id: '2',
      filledColumns: 2,
      filledRows: 2,
    },
    {
      id: '3',
      filledColumns: 2,
      filledRows: 2
    }
  ]
}

export default function Home() {
  const [layout, setLayout] = useState(Layout.create(rawLayout))

  return (
    <div className='w-screen h-screen overflow-auto flex gap-4'>
      <LayoutFlow layout={layout} className='bg-square' onLayoutChange={setLayout}>
        {layout.items.map(item => (
          <div key={item.id} className='bg-red-500 flex items-center justify-center flex-col overflow-hidden'>
            {item.id}
          </div>
        ))}
      </LayoutFlow>
      <button className='bg-green-500 p-4 rounded-lg h-12 flex items-center justify-center' onClick={() => {
        setLayout(previousLayout => previousLayout.fillEmptySlicesWithPlaceholder({}))
      }}>Placeholder</button>
    </div>
  )
}