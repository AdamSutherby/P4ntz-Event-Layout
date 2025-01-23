import { useState, useEffect } from "react"
import type { Goal } from "./Dashboard"

interface SetGoalProps {
  goal: Goal | null;
  updateGoal: (goal: Goal) => void;
  currentAmount: number;
  symbol: string;
  symbolPosition: 'left' | 'right';
}

const SetGoal: React.FC<SetGoalProps> = ({
  goal,
  updateGoal,
  currentAmount,
  symbol,
  symbolPosition
}) => {
  const [name, setName] = useState("")
  const [target, setTarget] = useState("")

  useEffect(() => {
    if (goal) {
      setName(goal.name)
      setTarget(goal.target.toString())
    }
  }, [goal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateGoal({
      id: goal?.id || Date.now().toString(),
      name,
      target: Number.parseFloat(target),
    })
  }

  const progress = goal ? (currentAmount / goal.target) * 100 : 0

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Set Goal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1">
            Goal Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="target" className="block mb-1">
            Target Amount
          </label>
          <input
            type="number"
            id="target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full p-2 border rounded"
            required
            min="0"
            step="0.01"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {goal ? "Update Goal" : "Set Goal"}
        </button>
      </form>
      {goal && (
        <div className="mt-4">
          <h3 className="font-bold">Current Progress</h3>
          <p>
            {symbol}
            {currentAmount.toFixed(2)} / {symbol}
            {goal.target.toFixed(2)} ({progress.toFixed(1)}%)
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, progress)}%` }}></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SetGoal;

