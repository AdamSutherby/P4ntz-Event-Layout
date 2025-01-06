'use client'

import React from 'react';
import { useReplicant } from '../../utils/nodecg';

interface Goal {
  id: number;
  type: 'flat' | 'incremental' | 'subathon';
  target: number;
  current: number;
  increment?: number;
  timer?: number;
}

export default function Graphics() {
  const [totalIncome] = useReplicant<number>('totalIncome', 0);
  const [goals] = useReplicant<Goal[]>('goals', []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Stream Goals</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Total Income: ${totalIncome}</h2>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Goals</h2>
        {goals.map((goal) => (
          <div key={goal.id} className="mb-2">
            <h3 className="font-semibold">{goal.type} Goal</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${(goal.current / goal.target) * 100}%` }}
              ></div>
            </div>
            <p>
              Progress: {goal.current}/{goal.target}
              {goal.type === 'incremental' && ` (+${goal.increment})`}
            </p>
            {goal.timer && <p>Time remaining: {goal.timer} minutes</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

