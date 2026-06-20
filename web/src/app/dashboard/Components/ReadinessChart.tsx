'use client';
import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface ReadinessChartProps {
  score: number;
}

export default function ReadinessChart({ score }: ReadinessChartProps) {
  const data = [{ name: 'score', value: score, fill: 'var(--primary)' }];

  return (
    <div className="relative w-40 h-40">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={12}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: 'var(--muted)' }}
            dataKey="value"
            angleAxisId={0}
            cornerRadius={6}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p
          className="text-3xl font-extrabold tabular-nums leading-none"
          style={{ color: 'var(--primary)' }}
        >
          {score}
        </p>
        <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          / 100
        </p>
      </div>
    </div>
  );
}
