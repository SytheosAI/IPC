'use client';

import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsCharts = () => {
  // Sample data for charts
  const monthlyData = [
    { month: 'Jan', permits: 45, inspections: 38, revenue: 125000 },
    { month: 'Feb', permits: 52, inspections: 42, revenue: 138000 },
    { month: 'Mar', permits: 48, inspections: 45, revenue: 142000 },
    { month: 'Apr', permits: 61, inspections: 55, revenue: 165000 },
    { month: 'May', permits: 58, inspections: 52, revenue: 158000 },
    { month: 'Jun', permits: 67, inspections: 60, revenue: 175000 },
  ];

  const projectTypeData = [
    { name: 'Residential', value: 45, color: '#3B82F6' },
    { name: 'Commercial', value: 30, color: '#10B981' },
    { name: 'Industrial', value: 15, color: '#F59E0B' },
    { name: 'Government', value: 10, color: '#8B5CF6' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <div className="card-modern p-6">
          <h3 className="text-lg font-bold text-yellow-400 mb-4">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #FDE047',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="permits"
                stroke="#FDE047"
                strokeWidth={2}
                dot={{ fill: '#FDE047' }}
              />
              <Line
                type="monotone"
                dataKey="inspections"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Project Type Distribution */}
        <div className="card-modern p-6">
          <h3 className="text-lg font-bold text-yellow-400 mb-4">Project Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {projectTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #FDE047',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="card-modern p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-yellow-400 mb-4">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #FDE047',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => `$${value.toLocaleString()}`}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#FDE047" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;