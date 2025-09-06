import React, { memo } from 'react';

interface PerformanceDialProps {
  label: string;
  value: number;
  maxValue?: number;
  unit?: string;
  color?: 'green' | 'yellow' | 'red' | 'blue';
  size?: 'sm' | 'md' | 'lg';
}

const PerformanceDial = memo(function PerformanceDial({ 
  label, 
  value, 
  maxValue = 100, 
  unit = '%', 
  color = 'blue',
  size = 'md'
}: PerformanceDialProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const colorMap = {
    green: { stroke: '#10b981', bg: '#065f46' },
    yellow: { stroke: '#f59e0b', bg: '#92400e' },
    red: { stroke: '#ef4444', bg: '#991b1b' },
    blue: { stroke: '#3b82f6', bg: '#1e40af' }
  };
  
  const sizeMap = {
    sm: { width: 120, height: 120, fontSize: 'text-lg' },
    md: { width: 150, height: 150, fontSize: 'text-xl' },
    lg: { width: 180, height: 180, fontSize: 'text-2xl' }
  };
  
  const currentSize = sizeMap[size];
  const currentColor = colorMap[color];
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: currentSize.width, height: currentSize.height }}>
        <svg 
          className="transform -rotate-90" 
          width={currentSize.width} 
          height={currentSize.height}
        >
          {/* Background circle */}
          <circle
            cx={currentSize.width / 2}
            cy={currentSize.height / 2}
            r="45"
            stroke="rgba(75, 85, 99, 0.3)"
            strokeWidth="8"
            fill="transparent"
          />
          
          {/* Progress circle */}
          <circle
            cx={currentSize.width / 2}
            cy={currentSize.height / 2}
            r="45"
            stroke={currentColor.stroke}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${currentColor.stroke})`
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`font-bold text-gray-100 ${currentSize.fontSize}`}>
              {Math.round(value)}<span className="text-sm">{unit}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Label */}
      <div className="mt-3 text-center">
        <h3 className="text-sm font-medium text-gray-300">{label}</h3>
      </div>
    </div>
  );
});

export default PerformanceDial;