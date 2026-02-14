'use client';

import React, { useState } from 'react';
import { LeaderReport, ComparisonData } from '../types/types';
import FileUpload from './FileUpload';
import ComparisonTable from './ComparisonTable';
import Visualization from './Visualization';

const LeaderReportsAnalyzer: React.FC = () => {
  const [reports, setReports] = useState<LeaderReport[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);

  const handleFilesUploaded = (uploadedReports: LeaderReport[]) => {
    setReports(uploadedReports);
    if (uploadedReports.length >= 2) {
      generateComparisonData(uploadedReports);
    }
  };

  const generateComparisonData = (uploadedReports: LeaderReport[]) => {
    const comparison: ComparisonData = {
      leaders: [],
      metrics: []
    };

    const leaderMap = new Map<string, any>();

    uploadedReports.forEach((report, reportIndex) => {
      report.leaders.forEach((leader) => {
        if (!leaderMap.has(leader.name)) {
          leaderMap.set(leader.name, {
            name: leader.name,
            values: new Array(uploadedReports.length).fill(null)
          });
        }
        leaderMap.get(leader.name)!.values[reportIndex] = leader.score;
      });
    });

    comparison.leaders = Array.from(leaderMap.values());

    const metricMap = new Map<string, any>();

    uploadedReports.forEach((report, reportIndex) => {
      if (report.additionalMetrics) {
        Object.entries(report.additionalMetrics).forEach(([key, value]) => {
          if (!metricMap.has(key)) {
            metricMap.set(key, {
              name: key,
              values: new Array(uploadedReports.length).fill(null)
            });
          }
          metricMap.get(key)!.values[reportIndex] = value;
        });
      }
    });

    comparison.metrics = Array.from(metricMap.values());

    setComparisonData(comparison);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Leader Reports Analyzer
        </h1>
        
        <FileUpload onFilesUploaded={handleFilesUploaded} />
        
        {reports.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Uploaded Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {reports.map((report, index) => (
                <div
                  key={index}
                  className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                >
                  <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
                  <p className="text-sm text-gray-400">Date: {report.date}</p>
                  <p className="text-sm text-gray-400">Leaders: {report.leaders.length}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {comparisonData && reports.length >= 2 && (
          <>
            <ComparisonTable
              comparisonData={comparisonData}
              reportTitles={reports.map(r => r.title)}
            />
            
            <Visualization
              comparisonData={comparisonData}
              reportTitles={reports.map(r => r.title)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderReportsAnalyzer;
