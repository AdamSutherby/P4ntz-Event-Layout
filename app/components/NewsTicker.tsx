import type { ReactElement } from "react"
import { useState, useEffect, useRef, isValidElement } from "react"
import type { Goal, RecurringGoalType } from "./Dashboard"

type TickerItem = {
  content: React.ReactElement | string
  id: string
  type: string
}

type NewsTickerProps = {
  setGoal: Goal | null
  milestoneGoals: Goal[]
  currentAmount: number
  recurringGoal: RecurringGoalType | null
  customItems: TickerItem[]
  symbol: string
  symbolPosition: "left" | "right"
  lastAddedAmount: number
  completedGoal: Goal | null
  isVisible: boolean
}

const ProgressBar = ({
  current,
  target,
  label,
  animate = false,
  weight = 1,
  prevAmount,
  symbol,
  symbolPosition,
}: {
  current: number
  target: number
  label: string
  animate?: boolean
  weight?: number
  prevAmount: number
  symbol: string
  symbolPosition: "left" | "right"
}) => {
  const progress = (current / target) * 100
  const prevProgress = (prevAmount / target) * 100
  const [displayProgress, setDisplayProgress] = useState(prevProgress)

  useEffect(() => {
    setDisplayProgress(prevProgress)
    const timer = setTimeout(() => {
      setDisplayProgress(progress)
    }, 50)
    return () => clearTimeout(timer)
  }, [current])

  const formatAmount = (amount: number) => {
    return symbolPosition === "left" ? `${symbol}${amount.toFixed(2)}` : `${amount.toFixed(2)}${symbol}`
  }

  return (
    <div className="w-full" style={{ flex: weight }}>
      <p className="font-bold mb-1 text-[#FF71CE] text-shadow-neon">{label}</p>
      <div className="relative h-10 bg-[#01012B] rounded-full overflow-hidden border-2 border-[#05FFA1]">
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#B967FF] to-[#FF71CE] transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(100, displayProgress)}%` }}
        >
          {animate && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#05FFA1] to-[#01FFFF] transition-all duration-1000 ease-out"
              style={{ 
                width: `${Math.min(100, ((current - prevAmount) / (target - prevAmount)) * 100)}%`,
                opacity: current !== prevAmount ? 1 : 0
              }}
            />
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <span className="text-white text-shadow-neon font-bold transition-all duration-1000">{formatAmount(current)}</span>
          <span className="text-white text-shadow-neon font-bold transition-all duration-1000">{progress.toFixed(1)}%</span>
          <span className="text-white text-shadow-neon font-bold">{formatAmount(target)}</span>
        </div>
      </div>
    </div>
  )
}

export default function NewsTicker({
  setGoal,
  milestoneGoals,
  currentAmount,
  recurringGoal,
  customItems,
  symbol,
  symbolPosition,
  lastAddedAmount,
  completedGoal,
  isVisible,
}: NewsTickerProps) {
  const [animateProgress, setAnimateProgress] = useState(false)
  const [isContentVisible, setIsContentVisible] = useState(true) // Add this line
  const prevAmountRef = useRef(currentAmount)
  const lastShownTypeRef = useRef<{ type: string; id?: string } | null>(null)
  const [currentInfo, setCurrentInfo] = useState<React.ReactElement | string>("")
  const [completedGoalsShown, setCompletedGoalsShown] = useState<Set<string>>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('completedGoals')
      return new Set(saved ? JSON.parse(saved) : [])
    }
    return new Set()
  })

  const handleGoalCompletion = (goalId: string) => {
    setCompletedGoalsShown(prev => {
      const newSet = new Set([...prev, goalId])
      // Save to localStorage
      localStorage.setItem('completedGoals', JSON.stringify([...newSet]))
      return newSet
    })
  }

  // Modified useEffect for content changes
  useEffect(() => {
    if (completedGoal || lastAddedAmount || !currentInfo) {
      setIsContentVisible(false) // Start fade out
      const timer = setTimeout(() => {
        if (completedGoal) {
          setCurrentInfo(getCompletedGoalInfo(completedGoal))
        } else if (lastAddedAmount) {
          setCurrentInfo(getMostProgressedGoalInfo())
        } else {
          setCurrentInfo(getNextInfo())
        }
        setIsContentVisible(true) // Start fade in
      }, 400) // Increased from 300 to 400 to allow fade out to complete
      return () => clearTimeout(timer)
    }
  }, [completedGoal, lastAddedAmount])

  // Handle value animations
  useEffect(() => {
    if (prevAmountRef.current !== currentAmount) {
      setAnimateProgress(true)
      setTimeout(() => setAnimateProgress(false), 1000)
    }
    prevAmountRef.current = currentAmount
  }, [currentAmount])

  const getNextInfo = () => {
    // Check for newly completed goals first
    const goalItems = getGoalInfo()
    const newlyCompletedGoal = goalItems.find(item => {
      const progress = (currentAmount / item.target) * 100
      return progress >= 100 && !completedGoalsShown.has(item.id)
    })

    if (newlyCompletedGoal) {
      // Mark this goal as shown
      handleGoalCompletion(newlyCompletedGoal.id)
      
      // Return completion animation
      return getCompletedGoalInfo({
        id: newlyCompletedGoal.id,
        name: newlyCompletedGoal.name,
        target: newlyCompletedGoal.target
      } as Goal)
    }

    // Filter out completed goals from regular rotation
    const activeGoalItems = goalItems.filter(item => {
      const progress = (currentAmount / item.target) * 100
      return progress < 100 && !completedGoalsShown.has(item.id)
    })

    const recurringItems = getRecurringGoalInfo()
    const mappedCustomItems = (customItems || []).map((item) => ({ 
      content: item.content, 
      weight: 1,
      type: 'custom',
      id: item.id 
    }))

    // If no active items and no custom items, show "All goals completed!"
    if (activeGoalItems.length === 0 && mappedCustomItems.length === 0 && !recurringGoal) {
      return <p className="text-white text-shadow-neon text-xl font-bold">All goals completed!</p>
    }

    // Calculate total weights for each category
    const customTotalWeight = mappedCustomItems.length > 0 ? 0.25 : 0
    const remainingWeight = 1 - customTotalWeight

    // Calculate progress-based weights for goals
    const goalTotalWeight = activeGoalItems.reduce((sum, item) => sum + item.weight, 0)
    const recurringTotalWeight = recurringItems.length // Each recurring item has weight of 1

    // Normalize weights within the remaining 75% for goals and recurring
    const normalizer = remainingWeight / (goalTotalWeight + recurringTotalWeight)

    // Prepare weighted items
    const weightedItems = [
      ...activeGoalItems.map(item => ({
        ...item,
        weight: item.weight * normalizer
      })),
      ...recurringItems.map(item => ({
        ...item,
        weight: normalizer // Each recurring item gets equal share of remaining weight
      })),
      ...mappedCustomItems.map(item => ({
        ...item,
        weight: customTotalWeight / mappedCustomItems.length // Distribute custom weight equally
      }))
    ]

    // Filter out items we just showed
    const availableItems = weightedItems.filter(item => 
      !lastShownTypeRef.current || 
      item.id !== lastShownTypeRef.current.id
    )

    if (availableItems.length === 0) {
      return "No information available"
    }

    // Select an item based on weights
    const totalWeight = availableItems.reduce((sum, item) => sum + item.weight, 0)
    let random = Math.random() * totalWeight
    let selectedItem = availableItems[0]

    for (const item of availableItems) {
      if (random <= item.weight) {
        selectedItem = item
        break
      }
      random -= item.weight
    }

    // Track what we're showing
    lastShownTypeRef.current = { 
      type: selectedItem.type, 
      id: selectedItem.id 
    }

    return selectedItem.content
  }

  const getGoalInfo = () => {
    const allGoals = [setGoal, ...(milestoneGoals || [])].filter(Boolean) as Goal[]
    return allGoals.map((goal) => {
      const progress = (currentAmount / goal.target) * 100
      // Ensure completed goals get returned but won't show in regular rotation
      const weight = progress >= 100 ? 0 : (1 + (progress > 0 ? 0.5 : 0))
      return {
        content: (
          <ProgressBar
            key={goal.id}
            current={currentAmount}
            target={goal.target}
            label={goal.name}
            animate={animateProgress}
            weight={progress}
            prevAmount={prevAmountRef.current}
            symbol={symbol}
            symbolPosition={symbolPosition}
          />
        ),
        weight,
        type: 'goal',
        id: goal.id,
        target: goal.target, // Add target for completion check
        name: goal.name // Add name for completion message
      }
    })
  }

  const getRecurringGoalInfo = () => {
    if (!recurringGoal) return []

    const nextMilestone = Math.ceil(currentAmount / recurringGoal.interval) * recurringGoal.interval
    const timesReached = Math.floor(currentAmount / recurringGoal.interval)

    return [
      {
        content: (
          <div key="recurring-goal" className="space-y-2">
            <ProgressBar
              current={currentAmount % recurringGoal.interval}
              target={recurringGoal.interval}
              label={recurringGoal.action}
              animate={animateProgress}
              prevAmount={prevAmountRef.current}
              symbol={symbol}
              symbolPosition={symbolPosition}
            />
            <p className="text-white text-shadow font-bold">
              Next game added at a total of {" "}
              {symbolPosition === "left"
                ? `${symbol}${nextMilestone.toFixed(2)}`
                : `${nextMilestone.toFixed(2)}${symbol}`}{" "}
              | {timesReached} games added
            </p>
          </div>
        ),
        weight: 1, // Standard weight for recurring goal
        type: "recurring",
        id: "recurring-goal",
      },
    ]
  }

  const getMostProgressedGoalInfo = () => {
    const allGoals = [setGoal, ...(milestoneGoals || [])].filter(Boolean) as Goal[]
    const mostProgressedGoal = allGoals.reduce((prev, current) => {
      const prevProgress = (currentAmount / prev.target) * 100
      const currentProgress = (currentAmount / current.target) * 100
      return currentProgress > prevProgress ? current : prev
    })

    return (
      <ProgressBar
        current={currentAmount}
        target={mostProgressedGoal.target}
        label={mostProgressedGoal.name}
        animate={true}
        prevAmount={prevAmountRef.current}
        symbol={symbol}
        symbolPosition={symbolPosition}
      />
    )
  }

  const getCompletedGoalInfo = (goal: Goal) => {
    return (
      <div className="space-y-2">
        <ProgressBar
          current={goal.target}
          target={goal.target}
          label={`Goal Completed: ${goal.name}`}
          animate={true}
          prevAmount={prevAmountRef.current}
          symbol={symbol}
          symbolPosition={symbolPosition}
        />
        <p className="text-white text-shadow text-xl font-bold animate-pulse text-center">Incentive Met!</p>
      </div>
    )
  }

  useEffect(() => {
    const allGoals = [setGoal, ...(milestoneGoals || [])].filter(Boolean) as Goal[]
    const stillCompletedGoals = new Set(
      [...completedGoalsShown].filter(id => {
        const goal = allGoals.find(g => g.id === id)
        return goal && currentAmount >= goal.target
      })
    )
    
    // Update localStorage with currently valid completed goals
    localStorage.setItem('completedGoals', JSON.stringify([...stillCompletedGoals]))
    setCompletedGoalsShown(stillCompletedGoals)
  }, [currentAmount, setGoal, milestoneGoals])

  useEffect(() => {
    prevAmountRef.current = currentAmount
  }, [currentAmount])

  return (
    <div className="vaporwave-container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .text-shadow-neon {
          font-family: 'Press Start 2P', cursive;
          text-shadow: 0 0 4px #FF71CE, 0 0 8px #FF71CE, 0 0 12px #FF71CE;
          animation: neon-flicker 1.5s infinite alternate;
        }
        
        .vaporwave-container {
          height: 120px;
          display: flex;
          align-items: center;
          background: 
            linear-gradient(
              45deg,
              #01012B,
              #240B36,
              #1A0B2E,
              #01012B
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 50px,
              rgba(5, 255, 161, 0.1) 50px,
              rgba(5, 255, 161, 0.1) 51px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 50px,
              rgba(5, 255, 161, 0.1) 50px,
              rgba(5, 255, 161, 0.1) 51px
            );
          background-size: 300% 300%, 100px 100px, 100px 100px;
          padding: 1rem;
          border: 2px solid transparent;
          border-radius: 8px;
          position: relative;
          animation: 
            background-rotate 12s ease-in-out infinite,
            grid-move 15s linear infinite;
          will-change: background-position;
        }

        .vaporwave-container::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 8px;
          padding: 2px;
          background: linear-gradient(
            45deg,
            #05FFA1,
            rgba(1, 255, 255, 0.8),
            rgba(255, 113, 206, 0.7),
            rgba(185, 103, 255, 0.8),
            #05FFA1
          );
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: border-rotate 8s ease-in-out infinite;
          background-size: 300% 300%;
          will-change: background-position;
        }

        .content-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          position: relative;
        }

        .content-fade {
          position: absolute;
          width: 100%;
          transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          transform: scale(0.98);
        }
        
        .content-fade.visible {
          opacity: 1;
          transform: scale(1);
        }

        @keyframes neon-flicker {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }

        @keyframes border-rotate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes background-rotate {
          0% { background-position: 0% 50%, 0 0, 0 0; }
          50% { background-position: 100% 50%, 0 0, 0 0; }
          100% { background-position: 0% 50%, 0 0, 0 0; }
        }

        @keyframes grid-move {
          0% {
            background-position: 0 0, 0 0, 0 0;
          }
          100% {
            background-position: 0 0, 100px 0, 0 100px;
          }
        }
      `}</style>
      <div className="content-wrapper">
        <div className={`content-fade ${isContentVisible && isVisible ? 'visible' : ''}`}>
          {currentInfo}
        </div>
      </div>
    </div>
  )
}

