"use client"

import { useState, useEffect, useRef } from "react"
import NewsTicker from "../components/NewsTicker"
import type { DashboardData, Goal, TickerItem } from "../components/Dashboard"

export default function TickerPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [lastAddedAmount, setLastAddedAmount] = useState(0)
  const [completedGoal, setCompletedGoal] = useState<Goal | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [key, setKey] = useState(0) // Force re-render of NewsTicker
  const currentDisplayRef = useRef<{ type: string; id?: string } | null>(null)

  useEffect(() => {
    const loadData = () => {
      const savedData = localStorage.getItem("streamerGoalsData")
      if (savedData) {
        const newData = JSON.parse(savedData)
        setData((prevData) => {
          if (!prevData) return newData
          
          // Keep current key if we're just updating values
          // Only force new content if goals structure changes
          const structureChanged = 
            JSON.stringify({ 
              setGoal: prevData.setGoal?.id, 
              milestoneGoals: prevData.milestoneGoals.map(g => g.id),
              recurringGoal: prevData.recurringGoal?.interval,
              tickerItems: prevData.tickerItems.map(i => i.id)
            }) !== 
            JSON.stringify({ 
              setGoal: newData.setGoal?.id, 
              milestoneGoals: newData.milestoneGoals.map((g:Goal) => g.id),
              recurringGoal: newData.recurringGoal?.interval,
              tickerItems: newData.tickerItems.map((i: TickerItem) => i.id)
            })

          if (structureChanged) {
            currentDisplayRef.current = null // Reset display state
            return newData
          }

          // If only values changed, preserve the current display
          return {
            ...newData,
            lastAddedAmount: newData.currentAmount - prevData.currentAmount
          }
        })
      }
    }

    // Initial load
    loadData()
    
    // Poll for updates
    const pollInterval = setInterval(loadData, 2000)

    // Switch display periodically only if not showing a specific item
    const displayInterval = setInterval(() => {
      if (!currentDisplayRef.current) {
        setIsVisible(false)
        // Wait for fade-out (600ms) before changing content
        setTimeout(() => {
          currentDisplayRef.current = null
          setKey(prev => prev + 1)
          // Add longer delay (500ms) before starting fade-in
          setTimeout(() => {
            setIsVisible(true)
          }, 100)
        }, 600)
      }
    }, 20000)

    return () => {
      clearInterval(pollInterval)
      clearInterval(displayInterval)
    }
  }, [])

  useEffect(() => {
    const handleTickerUpdate = (event: CustomEvent<Partial<DashboardData>>) => {
      if (event.detail.lastAddedAmount) {
        // Don't change display, just update the amount
        setData(prevData => prevData ? {
          ...prevData,
          currentAmount: (prevData.currentAmount || 0) + event.detail.lastAddedAmount!,
          lastAddedAmount: event.detail.lastAddedAmount || 0
        } : null)
      } else if (event.detail.completedGoal) {
        setCompletedGoal(event.detail.completedGoal)
        currentDisplayRef.current = { type: 'goal', id: event.detail.completedGoal.id }
      }
    }

    window.addEventListener("tickerUpdate", handleTickerUpdate as EventListener)
    return () => window.removeEventListener("tickerUpdate", handleTickerUpdate as EventListener)
  }, [])

  useEffect(() => {
    if (lastAddedAmount !== 0) {
      setTimeout(() => setLastAddedAmount(0), 100)
    }
  }, [lastAddedAmount])

  useEffect(() => {
    if (completedGoal) {
      setTimeout(() => setCompletedGoal(null), 5000)
    }
  }, [completedGoal])

  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <div className="h-screen flex items-center justify-center bg-transparent">
      <div className="w-full max-w-3xl p-4">
        <NewsTicker
          key={key}
          setGoal={data?.setGoal}
          milestoneGoals={data?.milestoneGoals || []}
          currentAmount={data?.currentAmount || 0}
          recurringGoal={data?.recurringGoal}
          customItems={data?.tickerItems || []}
          symbol={data?.symbol || "$"}
          symbolPosition={data?.symbolPosition || "left"}
          lastAddedAmount={lastAddedAmount}
          completedGoal={completedGoal}
          isVisible={isVisible}
        />
      </div>
    </div>
  )
}

