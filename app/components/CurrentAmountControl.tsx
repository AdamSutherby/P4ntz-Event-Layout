import { useState } from "react"

type CurrentAmountControlProps = {
  currentAmount: number
  updateCurrentAmount: (amount: number) => void
  symbol: string
  updateSymbol: (symbol: string) => void
  symbolPosition: "left" | "right"
  toggleSymbolPosition: () => void
}

export default function CurrentAmountControl({
  currentAmount,
  updateCurrentAmount,
  symbol,
  updateSymbol,
  symbolPosition,
  toggleSymbolPosition,
}: CurrentAmountControlProps) {
  const [inputValue, setInputValue] = useState("")
  const [subValue, setSubValue] = useState("1")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleSubValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubValue(e.target.value)
  }

  const handleAddSubtract = (isAdd: boolean) => {
    const amount = Number.parseFloat(inputValue)
    if (!isNaN(amount)) {
      updateCurrentAmount(isAdd ? amount : -amount)
      setInputValue("")
    }
  }

  const handleSubAdd = (multiplier: number) => {
    const amount = Number.parseFloat(subValue) * multiplier
    updateCurrentAmount(amount)
    setSubValue("1")
  }

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSymbol(e.target.value)
  }

  const formatAmount = (amount: number) => {
    return symbolPosition === "left" ? `${symbol}${amount.toFixed(2)}` : `${amount.toFixed(2)}${symbol}`
  }

  return (
    <div className="p-4 border rounded">
      <h2 className="text-2xl font-bold mb-4">Current Amount Control</h2>
      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          value={symbol}
          onChange={handleSymbolChange}
          className="p-2 border rounded w-16"
          placeholder="Symbol"
        />
        <button onClick={toggleSymbolPosition} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">
          Symbol: {symbolPosition === "left" ? "Left" : "Right"}
        </button>
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          className="p-2 border rounded w-32"
          placeholder="Enter amount"
          step="0.01"
        />
        <button onClick={() => handleAddSubtract(true)} className="bg-green-500 text-white px-4 py-2 rounded">
          Add
        </button>
        <button onClick={() => handleAddSubtract(false)} className="bg-red-500 text-white px-4 py-2 rounded">
          Subtract
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <input
          type="number"
          value={subValue}
          onChange={handleSubValueChange}
          className="p-2 border rounded w-24"
          placeholder="Subs"
          min="1"
          step="1"
        />
        <button onClick={() => handleSubAdd(5)} className="bg-blue-500 text-white px-4 py-2 rounded">
          x5
        </button>
        <button onClick={() => handleSubAdd(10)} className="bg-blue-500 text-white px-4 py-2 rounded">
          x10
        </button>
        <button onClick={() => handleSubAdd(30)} className="bg-blue-500 text-white px-4 py-2 rounded">
          x30
        </button>
      </div>
      <p className="mt-4 text-xl">Current Total: {formatAmount(currentAmount)}</p>
    </div>
  )
}

