import { useState, useEffect } from "react"
import { RecurringGoalType } from './Dashboard'

interface RecurringGoalProps {
  goal: RecurringGoalType | null;
  updateGoal: (goal: RecurringGoalType | null) => void;
  currentAmount: number;
  symbol: string;
}

const RecurringGoal: React.FC<RecurringGoalProps> = ({
  goal,
  updateGoal,
  currentAmount,
  symbol,
}) => {
  const [interval, setInterval] = useState("")
  const [action, setAction] = useState("")
  const [timesReached, setTimesReached] = useState(0)

  useEffect(() => {
    if (goal) {
      setInterval(goal.interval.toString())
      setAction(goal.action)
      setTimesReached(Math.floor(currentAmount / goal.interval))
    }
  }, [goal, currentAmount])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateGoal({
      interval: Number.parseFloat(interval),
      action
    })
  }

  const handleRemove = () => {
    updateGoal(null)
    setInterval("")
    setAction("")
  }

  const nextMilestone = goal ? Math.ceil(currentAmount / goal.interval) * goal.interval : 0

  return (
    <div className="p-4 border rounded">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Recurring Goal: {goal?.action}</h2>
        {goal && (
          <button
            onClick={handleRemove}
            className="text-red-500 hover:text-red-700"
          >
            Remove Goal
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="interval" className="block mb-1">
            Interval Amount
          </label>
          <input
            type="number"
            id="interval"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="w-full p-2 border rounded"
            required
            min="1"
            step="1"
          />
        </div>
        <div>
          <label htmlFor="action" className="block mb-1">
            Action
          </label>
          <input
            type="text"
            id="action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full p-2 border rounded"
            required
            placeholder="e.g., 'Do a dance'"
          />
        </div>
        <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded">
          {goal ? "Update Recurring Goal" : "Set Recurring Goal"}
        </button>
      </form>
      {goal && (
        <div className="mt-4">
          <h3 className="font-bold">Current Progress</h3>
          <p>
            Next milestone: {symbol}
            {nextMilestone.toFixed(2)}
          </p>
          <p>Action: {goal.action}</p>
          <p>Times reached: {timesReached}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
            <div
              className="bg-purple-600 h-2.5 rounded-full"
              style={{ width: `${((currentAmount % goal.interval) / goal.interval) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecurringGoal;

