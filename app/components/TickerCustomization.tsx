import { useState } from "react"
import type { TickerItem } from "./Dashboard"

type TickerCustomizationProps = {
  items: TickerItem[]
  updateItems: (items: TickerItem[]) => void
  showBackground: boolean
  showBorder: boolean
  onToggleBackground: () => void
  onToggleBorder: () => void
}

export default function TickerCustomization({
  items,
  updateItems,
  showBackground,
  showBorder,
  onToggleBackground,
  onToggleBorder,
}: TickerCustomizationProps) {
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
    <div>
      <h2 className="text-2xl font-bold mb-4">Ticker Customization</h2>
      
      <div className="mb-6 p-4 border rounded dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Visual Options</h3>
        <div className="flex gap-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showBackground}
              onChange={onToggleBackground}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium">Show Background Effect</span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showBorder}
              onChange={onToggleBorder}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium">Show Neon Border</span>
          </label>
        </div>
      </div>

      <div className="p-4 border rounded">
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
    </div>
  )
}