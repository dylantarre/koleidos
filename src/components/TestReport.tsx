import React from 'react';
import { BarChart2, CheckCircle2, AlertCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import type { TestReport } from '../types';

interface TestReportProps {
  report: TestReport;
}

interface HeaderStatsProps {
  score: number;
  successes: number;
  issues: number;
  isVisible: boolean;
}

function HeaderStats({ score, successes, issues, isVisible }: HeaderStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
      <div className="p-4 bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2 text-gradient mb-2">
          <BarChart2 className="w-5 h-5" />
          <span className="font-semibold">Overall Score</span>
        </div>
        <span className="text-2xl font-bold text-black dark:text-white block">
          {score}/100
        </span>
      </div>
      
      <div className="p-4 bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2 text-gradient mb-2">
          <CheckCircle2 className={`w-5 h-5 transform transition-all duration-500 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} />
          <span className="font-semibold">Successes</span>
        </div>
        <span className={`text-2xl font-bold text-black dark:text-white block transform transition-all duration-500 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {successes}
        </span>
      </div>
      
      <div className="p-4 bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2 text-gradient mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-semibold">Issues Found</span>
        </div>
        <span className="text-2xl font-bold text-black dark:text-white block">
          {issues}
        </span>
      </div>
    </div>
  );
}

interface CheckableItem {
  text: string;
  checked: boolean;
}

export function TestReport({ report }: TestReportProps) {
  const progressPercentage = (report.completedTests / report.totalTests) * 100;
  const [isVisible, setIsVisible] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [recommendations, setRecommendations] = React.useState<CheckableItem[]>(
    report.recommendations.map(rec => ({ text: rec, checked: false }))
  );
  const [commonIssues, setCommonIssues] = React.useState<CheckableItem[]>(
    report.commonIssues.map(issue => ({ text: issue, checked: false }))
  );

  React.useEffect(() => {
    // Trigger animation after mount
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  return (
    <div 
      className={`bg-white dark:bg-darker-blue/50 rounded-lg shadow-lg p-6 border border-gray-100 dark:border-white/10 transition-all duration-500 ease-out transform origin-top ${
        isVisible ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
      }`}
    >
      <div className="flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <h2 className="text-2xl font-bold dark:text-white">Test Report</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {report.completedTests}/{report.totalTests} tests completed
              </span>
              <div className="w-32 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              aria-label={isExpanded ? "Collapse report" : "Expand report"}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>
        
        <HeaderStats
          score={report.overallScore}
          successes={report.successes.length}
          issues={report.commonIssues.length}
          isVisible={isVisible}
        />

        <div className={`space-y-6 mt-6 transition-all duration-500 ${
          isExpanded 
            ? 'opacity-100 max-h-[2000px]' 
            : 'opacity-0 max-h-0 overflow-hidden'
        }`}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 dark:text-white">Summary</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base line-clamp-3">{report.summary}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 dark:text-white">Recommendations</h3>
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="flex items-start gap-2 w-full cursor-pointer"
                    onClick={() => {
                      setRecommendations(prev =>
                        prev.map((item, i) =>
                          i === index ? { ...item, checked: !item.checked } : item
                        )
                      );
                    }}
                  >
                    <div className="mt-1 flex-shrink-0">
                    {rec.checked ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 transition-all duration-300" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-all duration-300" />
                    )}
                    </div>
                    <span className={`text-gray-700 dark:text-gray-300 text-sm sm:text-base transition-all duration-300 ${
                    rec.checked ? 'line-through text-gray-400 dark:text-gray-500' : ''
                  }`}>{rec.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 dark:text-white">Common Issues</h3>
            <ul className="space-y-3">
              {commonIssues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="flex items-start gap-2 w-full cursor-pointer"
                    onClick={() => {
                      setCommonIssues(prev =>
                        prev.map((item, i) =>
                          i === index ? { ...item, checked: !item.checked } : item
                        )
                      );
                    }}
                  >
                    <div className="mt-1 flex-shrink-0">
                      {issue.checked ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 transition-all duration-300" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500 transition-all duration-300" />
                      )}
                    </div>
                    <span className={`text-gray-700 dark:text-gray-300 text-sm sm:text-base transition-all duration-300 ${
                      issue.checked ? 'line-through text-gray-400 dark:text-gray-500' : ''
                    }`}>{issue.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 dark:text-white">Successes</h3>
            <ul className="space-y-3">
              {report.successes.map((success, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">{success}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full mt-6 px-4 py-2 bg-gradient-custom text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-glow flex items-center justify-center gap-2"
          >
            <span>Read Full Report</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}