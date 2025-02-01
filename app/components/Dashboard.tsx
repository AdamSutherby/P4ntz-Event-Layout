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
  progress: number  // Add this field
  endTime?: Date  // Add this line
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
  showBackground?: boolean
  showBorder?: boolean
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
  showBackground: true,
  showBorder: true,
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>(initialData)
  const [lastAddedAmount, setLastAddedAmount] = useState(0)
  const [completedGoal, setCompletedGoal] = useState<Goal | null>(null)

  useEffect(() => {
    const savedData = localStorage.getItem("streamerGoalsData")
    if (savedData) {
      const parsed = JSON.parse(savedData)
      // Ensure all goals have a progress property
      if (parsed.setGoal) {
        parsed.setGoal.progress = parsed.setGoal.progress || 0
      }
      if (parsed.milestoneGoals) {
        parsed.milestoneGoals = parsed.milestoneGoals.map((goal: Goal) => ({
          ...goal,
          progress: goal.progress || 0
        }))
      }
      setData(parsed)
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

  const updateSetGoal = (goal: Goal | null) => { // Change parameter type to allow null
    setData((prevData) => ({ ...prevData, setGoal: goal }))
  }

  const updateMilestoneGoals = (goals: Goal[]) => {
    setData((prevData) => ({ ...prevData, milestoneGoals: goals }))
  }

  const updateCurrentAmount = (amount: number) => {
    setLastAddedAmount(amount)
    setData((prevData) => {
      const newAmount = Math.max(0, prevData.currentAmount + amount)
      
      // Update progress for all goals
      const updatedSetGoal = prevData.setGoal ? {
        ...prevData.setGoal,
        progress: Math.max(0, prevData.setGoal.progress + amount)
      } : null

      const updatedMilestoneGoals = prevData.milestoneGoals.map(goal => ({
        ...goal,
        progress: Math.max(0, goal.progress + amount)
      }))

      const newData = {
        ...prevData,
        currentAmount: newAmount,
        setGoal: updatedSetGoal,
        milestoneGoals: updatedMilestoneGoals
      }

      checkCompletedGoals(newData)
      sendTickerUpdate({ currentAmount: newAmount, lastAddedAmount: amount })
      return newData
    })
  }

  const checkCompletedGoals = (newData: DashboardData) => {
    const allGoals = [newData.setGoal, ...newData.milestoneGoals].filter(Boolean) as Goal[]
    const newlyCompletedGoal = allGoals.find((goal) => 
      goal.progress >= goal.target && goal.progress - lastAddedAmount < goal.target
    )
    if (newlyCompletedGoal) {
      setCompletedGoal(newlyCompletedGoal)
      sendTickerUpdate({ completedGoal: newlyCompletedGoal })
      setTimeout(() => {
        setCompletedGoal(null)
        sendTickerUpdate({ completedGoal: null })
      }, 5000)
    }
  }

  const updateRecurringGoal = (goal: RecurringGoalType | null) => {
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

  const toggleBackground = () => {
    setData(prevData => ({
      ...prevData,
      showBackground: !prevData.showBackground
    }))
  }

  const toggleBorder = () => {
    setData(prevData => ({
      ...prevData,
      showBorder: !prevData.showBorder
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
          symbol={data.symbol}
        />
        <MilestoneGoals
          goals={data.milestoneGoals}
          updateGoals={updateMilestoneGoals}
          symbol={data.symbol}
        />
        <RecurringGoal
          goal={data.recurringGoal}
          updateGoal={updateRecurringGoal}
          currentAmount={data.currentAmount}
          symbol={data.symbol}
        />
        <TickerCustomization 
          items={data.tickerItems} 
          updateItems={updateTickerItems}
          showBackground={data.showBackground ?? true}
          showBorder={data.showBorder ?? true}
          onToggleBackground={toggleBackground}
          onToggleBorder={toggleBorder}
        />
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">News Ticker Preview</h2>
          <div className="border p-4 h-[140px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <div className="h-full flex items-center">
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
                showBackground={data.showBackground ?? true}
                showBorder={data.showBorder ?? true}
                isVisible={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

