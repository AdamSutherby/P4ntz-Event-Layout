'use client'

import React, { useState, useEffect } from 'react';
import { useReplicant } from '../../utils/nodecg';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const IncomeInput: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [totalIncome, setTotalIncome] = useReplicant<number>('totalIncome', 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTotal = (totalIncome || 0) + Number(amount);
    setTotalIncome(newTotal);
    setAmount('');
  };

  const handleSubClick = (tier: number) => {
    const subValues = [5, 10, 30];
    const newTotal = (totalIncome || 0) + subValues[tier - 1];
    setTotalIncome(newTotal);
  };

  return (
    <div className="mb-6 p-6 bg-card rounded-lg shadow-md border border-gray-700">
      <h2 className="text-2xl font-semibold mb-4 text-primary">Add Income</h2>
      <p className="text-lg mb-4 text-secondary-foreground">Current Total: <span className="font-bold text-primary">${totalIncome.toFixed(2)}</span></p>
      <form onSubmit={handleSubmit} className="flex gap-4 mb-4">
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="flex-grow"
        />
        <Button type="submit" className="bg-primary hover:bg-primary/90">
          Add
        </Button>
      </form>
      <div className="flex gap-4">
        <Button onClick={() => handleSubClick(1)} className="flex-1 bg-purple-500 hover:bg-purple-600">
          Tier 1 Sub
        </Button>
        <Button onClick={() => handleSubClick(2)} className="flex-1 bg-purple-600 hover:bg-purple-700">
          Tier 2 Sub
        </Button>
        <Button onClick={() => handleSubClick(3)} className="flex-1 bg-purple-700 hover:bg-purple-800">
          Tier 3 Sub
        </Button>
      </div>
    </div>
  );
};

