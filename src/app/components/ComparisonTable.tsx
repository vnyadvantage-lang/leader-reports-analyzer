import React from 'react';
import { ComparisonData } from '../types/types';

interface ComparisonTableProps {
  comparisonData: ComparisonData;
  reportTitles: string[];
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  comparisonData,
  reportTitles,
}) => {
  const getCellColor = (values: (number | null)[], index: number) => {
    const value = values[index];
    if (value === null) return 'bg-gray-800';

    const validValues = values.filter((v): v is number => v !== null);
    if (validValues.length === 0) return 'bg-gray-800';

    const max = Math.max(...validValues);
    const min = Math.min(...validValues);

    if (value === max && max !== min) return 'bg-green-900/50';
    if (value === min && max !== min) return 'bg-red-900/50';
    return 'bg-gray-800';
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Comparison Table</h2>
      
      {comparisonData.leaders.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Leaders</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-gray-800 border border-gray-700 p-3 text-left">
                    Name
                  </th>
                  {reportTitles.map((title, index) => (
                    <th
                      key={index}
                      className="bg-gray-800 border border-gray-700 p-3 text-left"
                    >
                      {title}
                    </th>
                  ))}
                  <th className="bg-gray-800 border border-gray-700 p-3 text-left">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.leaders.map((leader, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="bg-gray-800 border border-gray-700 p-3 font-semibold">
                      {leader.name}
                    </td>
                    {leader.values.map((value, colIndex) => (
                      <td
                        key={colIndex}
                        className={`border border-gray-700 p-3 ${getCellColor(
                          leader.values,
                          colIndex
                        )}`}
                      >
                        {value !== null ? value.toFixed(2) : '-'}
                      </td>
                    ))}
                    <td className="bg-gray-800 border border-gray-700 p-3">
                      {(() => {
                        const validValues = leader.values.filter(
                          (v): v is number => v !== null
                        );
                        if (validValues.length < 2) return '-';
                        const first = validValues[0];
                        const last = validValues[validValues.length - 1];
                        const diff = last - first;
                        const percent = ((diff / first) * 100).toFixed(1);
                        return (
                          <span
                            className={diff > 0 ? 'text-green-400' : 'text-red-400'}
                          >
                            {diff > 0 ? '↑' : '↓'} {Math.abs(parseFloat(percent))}%
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {comparisonData.metrics.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Additional Metrics</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-gray-800 border border-gray-700 p-3 text-left">
                    Metric
                  </th>
                  {reportTitles.map((title, index) => (
                    <th
                      key={index}
                      className="bg-gray-800 border border-gray-700 p-3 text-left"
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonData.metrics.map((metric, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="bg-gray-800 border border-gray-700 p-3 font-semibold">
                      {metric.name}
                    </td>
                    {metric.values.map((value, colIndex) => (
                      <td
                        key={colIndex}
                        className={`border border-gray-700 p-3 ${getCellColor(
                          metric.values,
                          colIndex
                        )}`}
                      >
                        {value !== null ? value : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonTable;
