import { Layout } from "@/components/Layout";

const layout = {
  id: 'any_id',
  canEdit: true,
  sliceHeight: 85,
  sliceWidth: 85,
  gap: 5,
  totalColumns: 100,
  totalRows: 100,
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
      filledRows: 2
    }
  ]
}

export default function Home() {
  return (
    <Layout.Root layout={layout}>
      <Layout.Viewport className="h-full overflow-auto p-4">
        <Layout.Area className="bg-square">
          {layout.items.map(item => (
            <Layout.Item id={item.id} key={item.id} className="bg-green-500" />
          ))}
        </Layout.Area>
      </Layout.Viewport>
    </Layout.Root>
  )
}