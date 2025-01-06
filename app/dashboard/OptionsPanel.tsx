'use client'

import React from 'react';
import { useReplicant } from '../../utils/nodecg';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const OptionsPanel: React.FC = () => {
  const [subValues, setSubValues] = useReplicant('subValues', { tier1: 5, tier2: 10, tier3: 30 });

  const handleSubValueChange = (tier: keyof typeof subValues, value: number) => {
    setSubValues({ ...subValues, [tier]: value });
  };

  return (
    <div className="mb-6 p-6 bg-card rounded-lg shadow-md border border-gray-700">
      <h2 className="text-2xl font-semibold mb-4 text-primary">Options</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="tier1" className="text-sm font-medium text-secondary-foreground">Tier 1 Value</Label>
          <Input
            id="tier1"
            type="number"
            value={subValues.tier1}
            onChange={(e) => handleSubValueChange('tier1', Number(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="tier2" className="text-sm font-medium text-secondary-foreground">Tier 2 Value</Label>
          <Input
            id="tier2"
            type="number"
            value={subValues.tier2}
            onChange={(e) => handleSubValueChange('tier2', Number(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="tier3" className="text-sm font-medium text-secondary-foreground">Tier 3 Value</Label>
          <Input
            id="tier3"
            type="number"
            value={subValues.tier3}
            onChange={(e) => handleSubValueChange('tier3', Number(e.target.value))}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

