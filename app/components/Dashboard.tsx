"use client"

import { useState, useEffect } from "react"
import SetGoal from "./SetGoal"
import MilestoneGoals from "./MilestoneGoals"
import NewsTicker from "./NewsTicker"
import CurrentAmountControl from "./CurrentAmountControl"
import RecurringGoal from "./RecurringGoal"
import TickerCustomization from "./TickerCustomization"
import { ThemeToggle } from "./theme-toggle"

export type Goal = {
  id: string
  name: string
  target: number
}

export type RecurringGoalType = {
  interval: number
  action: string
}

export type TickerItem = {
  id: string
  content: string
  type: string;
}

export type DashboardData = {
  currentAmount: number
  setGoal: Goal | null
  milestoneGoals: Goal[]
  recurringGoal: RecurringGoalType | null
  tickerItems: TickerItem[]
  symbol: string
  symbolPosition: "left" | "right"
  completedGoal: Goal | null
  lastAddedAmount: number
}

const initialData: DashboardData = {
  currentAmount: 0,
  setGoal: null,
  milestoneGoals: [],
  recurringGoal: null,
  tickerItems: [],
  symbol: "$",
  symbolPosition: "left",
  completedGoal: null,
  lastAddedAmount: 0,
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>(initialData)
  const [lastAddedAmount, setLastAddedAmount] = useState(0)
  const [completedGoal, setCompletedGoal] = useState<Goal | null>(null)

  useEffect(() => {
    const savedData = localStorage.getItem("streamerGoalsData")
    if (savedData) {
      setData(JSON.parse(savedData))
    }
  }, [])

  const saveData = async (updateData: DashboardData) => {
    // Save to localStorage
    localStorage.setItem("streamerGoalsData", JSON.stringify(updateData))
    
    // Save to API
    try {
      await fetch('/api/ticker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })
    } catch (error) {
      console.error('Failed to save to API:', error)
    }
    
    sendTickerUpdate(updateData)
  }

  useEffect(() => {
    saveData(data)
  }, [data, saveData])

  const sendTickerUpdate = (updateData: Partial<DashboardData>) => {
    const event = new CustomEvent("tickerUpdate", { detail: updateData })
    window.dispatchEvent(event)
  }

  const updateSetGoal = (goal: Goal) => {
    setData((prevData) => ({ ...prevData, setGoal: goal }))
  }

  const updateMilestoneGoals = (goals: Goal[]) => {
    setData((prevData) => ({ ...prevData, milestoneGoals: goals }))
  }

  const updateCurrentAmount = (amount: number) => {
    setLastAddedAmount(amount)
    setData((prevData) => {
      const newAmount = Math.max(0, prevData.currentAmount + amount)
      const newData = { ...prevData, currentAmount: newAmount }
      checkCompletedGoals(newAmount)
      sendTickerUpdate({ currentAmount: newAmount, lastAddedAmount: amount })
      return newData
    })
  }

  const checkCompletedGoals = (newAmount: number) => {
    const allGoals = [data.setGoal, ...data.milestoneGoals].filter(Boolean) as Goal[]
    const newlyCompletedGoal = allGoals.find((goal) => data.currentAmount < goal.target && newAmount >= goal.target)
    if (newlyCompletedGoal) {
      setCompletedGoal(newlyCompletedGoal)
      sendTickerUpdate({ completedGoal: newlyCompletedGoal })
      setTimeout(() => {
        setCompletedGoal(null)
        sendTickerUpdate({ completedGoal: null })
      }, 5000)
    }
  }

  const updateRecurringGoal = (goal: RecurringGoalType) => {
    setData((prevData) => ({ ...prevData, recurringGoal: goal }))
  }

  const updateTickerItems = (items: TickerItem[]) => {
    setData((prevData) => ({ ...prevData, tickerItems: items }))
  }

  const updateSymbol = (newSymbol: string) => {
    setData((prevData) => ({ ...prevData, symbol: newSymbol }))
  }

  const toggleSymbolPosition = () => {
    setData((prevData) => ({
      ...prevData,
      symbolPosition: prevData.symbolPosition === "left" ? "right" : "left",
    }))
  }

  useEffect(() => {
    if (lastAddedAmount !== 0) {
      setTimeout(() => setLastAddedAmount(0), 100) // Reset after animation starts
    }
  }, [lastAddedAmount])

  return (
    <div className="min-h-screen p-4 bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="container mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Streamer Goals Dashboard</h1>
          <ThemeToggle />
        </div>
        <CurrentAmountControl
          currentAmount={data.currentAmount}
          updateCurrentAmount={updateCurrentAmount}
          symbol={data.symbol}
          updateSymbol={updateSymbol}
          symbolPosition={data.symbolPosition}
          toggleSymbolPosition={toggleSymbolPosition}
        />
        <SetGoal
          goal={data.setGoal}
          updateGoal={updateSetGoal}
          currentAmount={data.currentAmount}
          symbol={data.symbol}
        />
        <MilestoneGoals
          goals={data.milestoneGoals}
          updateGoals={updateMilestoneGoals}
          currentAmount={data.currentAmount}
          symbol={data.symbol}
        />
        <RecurringGoal
          goal={data.recurringGoal}
          updateGoal={updateRecurringGoal}
          currentAmount={data.currentAmount}
          symbol={data.symbol}
          symbolPosition={data.symbolPosition}
        />
        <TickerCustomization items={data.tickerItems} updateItems={updateTickerItems} />
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">News Ticker Preview</h2>
          <div className="border p-4 h-24 bg-gray-100 dark:bg-gray-800">
            <NewsTicker
              setGoal={data.setGoal}
              milestoneGoals={data.milestoneGoals}
              currentAmount={data.currentAmount}
              recurringGoal={data.recurringGoal}
              customItems={data.tickerItems}
              symbol={data.symbol}
              symbolPosition={data.symbolPosition}
              lastAddedAmount={lastAddedAmount}
              completedGoal={completedGoal}
              isVisible={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

