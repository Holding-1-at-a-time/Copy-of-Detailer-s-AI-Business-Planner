
import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsChartProps {
  data: any[];
  title: string;
  dataKey: string;
  color: string;
  valuePrefix?: string;
}

type ChartType = 'bar' | 'line';

const CustomTooltip = ({ active, payload, label, valuePrefix = '' }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const value = `${valuePrefix}${Number(data.value).toLocaleString()}`;
        
        return (
            <div className="bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg border border-gray-600 shadow-lg">
                <p className="label text-gray-400">{`${label}`}</p>
                <p className="intro text-white font-bold" style={{ color: data.payload.fill || data.color }}>{`${data.name}: ${value}`}</p>
            </div>
        );
    }
    return null;
};

const ChartTypeToggle: React.FC<{ selectedType: ChartType; onTypeChange: (type: ChartType) => void; }> = ({ selectedType, onTypeChange }) => (
    <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-700">
        <button 
            onClick={() => onTypeChange('bar')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition ${selectedType === 'bar' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            aria-pressed={selectedType === 'bar'}
            aria-label="Switch to Bar Chart"
        >
            Bar
        </button>
        <button
            onClick={() => onTypeChange('line')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition ${selectedType === 'line' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            aria-pressed={selectedType === 'line'}
            aria-label="Switch to Line Chart"
        >
            Line
        </button>
    </div>
);

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data, title, dataKey, color, valuePrefix }) => {
  const [type, setType] = useState<ChartType>('bar');
  
  // Dynamically determine the key for the X-axis based on the data provided.
  // This allows the component to be reused for time-series (date) and categorical (name) data.
  const xAxisKey = data.length > 0 && 'date' in data[0] ? 'date' : 'name';
  const ChartComponent = type === 'bar' ? BarChart : LineChart;
  
  // For Bar charts with categorical data, it's often better not to show the toggle.
  const showToggle = xAxisKey === 'date';

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-cyan-500/20 shadow-lg">
      <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          {showToggle && <ChartTypeToggle selectedType={type} onTypeChange={setType} />}
      </div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <ChartComponent data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey={xAxisKey} stroke="#A0AEC0" />
            <YAxis stroke="#A0AEC0" tickFormatter={(val) => valuePrefix && typeof val === 'number' ? `${valuePrefix}${val / 1000}k` : val} />
            <Tooltip content={<CustomTooltip valuePrefix={valuePrefix} />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }}/>
            {type === 'bar' ? (
                <Bar dataKey={dataKey} fill={color} name={title} />
            ) : (
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} name={title} dot={{ r: 4, fill: color }} activeDot={{ r: 8 }}/>
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;