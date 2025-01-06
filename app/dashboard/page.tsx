'use client'

import React from 'react';
import { Goals } from './Goals';
import { IncomeInput } from './IncomeInput';
import { OptionsPanel } from './OptionsPanel';

export default function Dashboard() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-primary">Streamer Goals Control</h1>
      <IncomeInput />
      <Goals />
      <OptionsPanel />
    </div>
  );
}

