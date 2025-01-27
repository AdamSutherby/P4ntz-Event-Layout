import { useState } from "react"
import type { Goal } from "./Dashboard"

interface MilestoneGoalsProps {
  goals: Goal[]
  updateGoals: (goals: Goal[]) => void
  symbol: string
}

export default function MilestoneGoals({
  goals,
  updateGoals,
  symbol,
}: MilestoneGoalsProps) {
  const [newGoalName, setNewGoalName] = useState("")
  const [newGoalTarget, setNewGoalTarget] = useState("")

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    const newGoal: Goal = {
      id: Date.now().toString(),
      name: newGoalName,
      target: Number(newGoalTarget),
      progress: 0 // Initialize progress to 0
    }
    updateGoals([...goals, newGoal])
    setNewGoalName("")
    setNewGoalTarget("")
  }

  const handleRemoveGoal = (id: string) => {
    updateGoals(goals.filter((goal) => goal.id !== id))
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Milestone Goals</h2>
      <form onSubmit={handleAddGoal} className="space-y-4 mb-4">
        <div>
          <label htmlFor="name" className="block mb-1">
            Goal Name
          </label>
          <input
            type="text"
            id="name"
            value={newGoalName}
            onChange={(e) => setNewGoalName(e.target.value)}
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
            value={newGoalTarget}
            onChange={(e) => setNewGoalTarget(e.target.value)}
            className="w-full p-2 border rounded"
            required
            min="0"
            step="0.01"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Milestone Goal
        </button>
      </form>
      <div className="space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="border p-4 rounded flex flex-col space-y-2"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold">{goal.name}</h3>
              <button
                onClick={() => handleRemoveGoal(goal.id)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
            <div>
              <p>
                Progress: {symbol}
                {goal.progress?.toFixed(2)} / {symbol}
                {goal.target.toFixed(2)} (
                {((goal.progress || 0) / goal.target * 100).toFixed(1)}%)
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      ((goal.progress || 0) / goal.target) * 100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

