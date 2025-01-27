import { useState } from "react"
import type { TickerItem } from "./Dashboard"

type TickerCustomizationProps = {
  items: TickerItem[]
  updateItems: (items: TickerItem[]) => void
}

export default function TickerCustomization({ items, updateItems }: TickerCustomizationProps) {
  const [newItem, setNewItem] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newItem.trim()) {
      const updatedItems = [...items, { 
        id: Date.now().toString(), 
        content: newItem.trim(),
        type: items[0]?.type || 'default' // Use existing type or default
      }]
      updateItems(updatedItems)
      setNewItem("")
    }
  }

  const handleRemove = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id)
    updateItems(updatedItems)
  }

  return (
    <div className="p-4 border rounded">
      <h2 className="text-2xl font-bold mb-4">Ticker Customization</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-4">
        <div>
          <label htmlFor="newItem" className="block mb-1">
            New Ticker Item (up to 3 lines)
          </label>
          <textarea
            id="newItem"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="w-full p-2 border rounded resize-none"
            placeholder="Enter custom ticker text"
            rows={3}
            maxLength={300}
          />
        </div>
        <button type="submit" className="bg-teal-500 text-white px-4 py-2 rounded">
          Add Ticker Item
        </button>
      </form>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <span className="whitespace-pre-line mr-4">{item.content}</span>
            <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700 flex-shrink-0">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}