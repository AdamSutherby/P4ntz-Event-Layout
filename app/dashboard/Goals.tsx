'use client'

import React, { useState } from 'react';
import { useReplicant } from '../../utils/nodecg';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Goal {
  id: number;
  type: 'flat' | 'incremental' | 'subathon';
  target: number;
  current: number;
  increment?: number;
  timer?: number;
}

export const Goals: React.FC = () => {
  const [goals, setGoals] = useReplicant<Goal[]>('goals', []);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({});

  const addGoal = () => {
    if (newGoal.type && newGoal.target) {
      const updatedGoals = [...goals, { ...newGoal, id: Date.now(), current: 0 } as Goal];
      setGoals(updatedGoals);
      setNewGoal({});
    }
  };

  const deleteGoal = (id: number) => {
    const updatedGoals = goals.filter((goal) => goal.id !== id);
    setGoals(updatedGoals);
  };

  const updateGoalProgress = (id: number, amount: number) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === id) {
        return { ...goal, current: goal.current + amount };
      }
      return goal;
    });
    setGoals(updatedGoals);
  };

  return (
    <div className="mb-6 p-6 bg-card rounded-lg shadow-md border border-gray-700">
      <h2 className="text-2xl font-semibold mb-4 text-primary">Goals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Select
          value={newGoal.type || ''}
          onValueChange={(value) => setNewGoal({ ...newGoal, type: value as Goal['type'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flat">Flat</SelectItem>
            <SelectItem value="incremental">Incremental</SelectItem>
            <SelectItem value="subathon">Subathon</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          value={newGoal.target || ''}
          onChange={(e) => setNewGoal({ ...newGoal, target: Number(e.target.value) })}
          placeholder="Target"
        />
        {newGoal.type === 'incremental' && (
          <Input
            type="number"
            value={newGoal.increment || ''}
            onChange={(e) => setNewGoal({ ...newGoal, increment: Number(e.target.value) })}
            placeholder="Increment"
          />
        )}
        <Input
          type="number"
          value={newGoal.timer || ''}
          onChange={(e) => setNewGoal({ ...newGoal, timer: Number(e.target.value) })}
          placeholder="Timer (minutes)"
        />
      </div>
      <Button onClick={addGoal} className="w-full bg-purple-700 hover:bg-purple-800 mb-4">
        Add Goal
      </Button>
      <ul className="space-y-2">
        {goals.map((goal) => (
          <li key={goal.id} className="flex justify-between items-center p-3 bg-background rounded shadow">
            <span className="text-primary">
              {goal.type} goal: {goal.current}/{goal.target}
              {goal.type === 'incremental' && ` (+${goal.increment})`}
              {goal.timer && ` (${goal.timer} minutes)`}
            </span>
            <div>
              <Button onClick={() => updateGoalProgress(goal.id, 1)} className="mr-2 bg-green-500 hover:bg-green-600">
                +1
              </Button>
              <Button onClick={() => deleteGoal(goal.id)} variant="destructive" size="sm">
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

