import React, { memo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

interface ChartData {
  name: string
  value: number
  color: string
}

interface SimplePieChartProps {
  data: ChartData[]
  height?: number
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({
  data,
  height = 200,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={60}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default memo(SimplePieChart)