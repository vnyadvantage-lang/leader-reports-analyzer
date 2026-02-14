'use client';

import React from 'react';
import { ComparisonData } from '../types/types';

interface VisualizationProps {
  comparisonData: ComparisonData;
  reportTitles: string[];
}

const Visualization: React.FC<VisualizationProps> = ({
  comparisonData,
  reportTitles,
}) => {
  const colors = [
    'rgb(59, 130, 246)',
    'rgb(16, 185, 129)',
    'rgb(249, 115, 22)',
    'rgb(236, 72, 153)',
    'rgb(168, 85, 247)',
    'rgb(251, 191, 36)',
  ];

  const getMaxValue = () => {
    let max = 0;
    comparisonData.leaders.forEach((leader) => {
      leader.values.forEach((val) => {
        if (val !== null && val > max) max = val;
      });
    });
    return max;
  };

  const maxValue = getMaxValue();

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Visualization</h2>
      
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Leader Performance Over Time</h3>
        
        <div className="relative" style={{ height: '400px' }}>
          <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const y = 350 - (i * 70);
              return (
                <g key={i}>
                  <line
                    x1="50"
                    y1={y}
                    x2="750"
                    y2={y}
                    stroke="#374151"
                    strokeWidth="1"
                  />
                  <text x="30" y={y + 5} fill="#9CA3AF" fontSize="12">
                    {((maxValue / 5) * i).toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {reportTitles.map((title, index) => {
              const x = 50 + (index * (700 / Math.max(reportTitles.length - 1, 1)));
              return (
                <text
                  key={index}
                  x={x}
                  y="380"
                  fill="#9CA3AF"
                  fontSize="12"
                  textAnchor="middle"
                >
                  {title.length > 15 ? title.substring(0, 15) + '...' : title}
                </text>
              );
            })}

            {/* Lines for each leader */}
            {comparisonData.leaders.map((leader, leaderIndex) => {
              const points = leader.values
                .map((val, index) => {
                  if (val === null) return null;
                  const x = 50 + (index * (700 / Math.max(reportTitles.length - 1, 1)));
                  const y = 350 - ((val / maxValue) * 350);
                  return { x, y, value: val };
                })
                .filter((p): p is { x: number; y: number; value: number } => p !== null);

              if (points.length === 0) return null;

              const pathData = points
                .map((point, index) => {
                  return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
                })
                .join(' ');

              return (
                <g key={leaderIndex}>
                  <path
                    d={pathData}
                    fill="none"
                    stroke={colors[leaderIndex % colors.length]}
                    strokeWidth="2"
                  />
                  {points.map((point, pointIndex) => (
                    <circle
                      key={pointIndex}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={colors[leaderIndex % colors.length]}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4">
          {comparisonData.leaders.map((leader, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm">{leader.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Visualization;
