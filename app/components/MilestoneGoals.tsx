import { useState } from "react"
import { Goal } from './Dashboard'

interface MilestoneGoalsProps {
  goals: Goal[];
  updateGoals: (goals: Goal[]) => void;
  currentAmount: number;
  symbol: string;
}

const MilestoneGoals: React.FC<MilestoneGoalsProps> = ({
  goals,
  updateGoals,
  currentAmount,
  symbol,
}) => {
  const [name, setName] = useState("")
  const [target, setTarget] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newGoal: Goal = {
      id: Date.now().toString(),
      name,
      target: Number.parseFloat(target),
    }
    updateGoals([...goals, newGoal].sort((a, b) => a.target - b.target))
    setName("")
    setTarget("")
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Milestone Goals</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-4">
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
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Add Milestone Goal
        </button>
      </form>
      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = (currentAmount / goal.target) * 100
          return (
            <div key={goal.id} className="border p-4 rounded">
              <h3 className="font-bold">{goal.name}</h3>
              <p>
                Target: {symbol}
                {goal.target.toFixed(2)}
              </p>
              <p>
                Progress: {symbol}
                {currentAmount.toFixed(2)} / {symbol}
                {goal.target.toFixed(2)} ({progress.toFixed(1)}%)
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, progress)}%` }}></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MilestoneGoals;

