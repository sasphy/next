import React, { useMemo } from 'react';
import { BondingCurveParams, BondingCurveType, generateBondingCurveData } from '@/lib/market-utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BondingCurveChartProps {
  params: BondingCurveParams;
  currentSupply: bigint;
  className?: string;
}

const BondingCurveChart: React.FC<BondingCurveChartProps> = ({ 
  params, 
  currentSupply,
  className = '' 
}) => {
  // Generate data points for the curve
  const data = useMemo(() => {
    return generateBondingCurveData(params, 30);
  }, [params]);
  
  // Find the current point on the curve
  const currentPoint = useMemo(() => {
    const supplyNumber = Number(currentSupply);
    // Find the closest point to current supply
    return data.find(point => Math.abs(point[0] - supplyNumber) < Number(params.maxSupply) / 30) || data[0];
  }, [data, currentSupply, params.maxSupply]);
  
  // Format the data for Recharts
  const chartData = useMemo(() => {
    return data.map(([supply, price]) => ({
      supply,
      price,
      // Add a marker for the current position
      currentMarker: supply === currentPoint?.[0] ? currentPoint[1] : null
    }));
  }, [data, currentPoint]);
  
  // Colors based on curve type
  const getCurveColor = () => {
    switch (params.curveType) {
      case BondingCurveType.LINEAR:
        return '#6366f1'; // Indigo
      case BondingCurveType.EXPONENTIAL:
        return '#8b5cf6'; // Violet
      case BondingCurveType.LOGARITHMIC:
        return '#ec4899'; // Pink
      case BondingCurveType.SIGMOID:
        return '#14b8a6'; // Teal
      default:
        return '#8b5cf6'; // Default purple
    }
  };
  
  const curveColor = getCurveColor();
  
  return (
    <div className={`w-full h-64 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          className="motion-opacity-in-[0] motion-duration-[1s]"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="supply" 
            label={{ 
              value: 'Supply', 
              position: 'insideBottomRight', 
              offset: -5,
              fill: 'rgba(255,255,255,0.6)'
            }}
            tick={{ fill: 'rgba(255,255,255,0.6)' }}
          />
          <YAxis 
            label={{ 
              value: 'Price (ETH)', 
              angle: -90, 
              position: 'insideLeft',
              fill: 'rgba(255,255,255,0.6)'
            }}
            tick={{ fill: 'rgba(255,255,255,0.6)' }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(6)} ETH`, 'Price']}
            labelFormatter={(label) => `Supply: ${label}`}
            contentStyle={{ 
              backgroundColor: 'rgba(13, 17, 23, 0.8)', 
              borderColor: 'rgba(138, 92, 246, 0.5)',
              borderRadius: '0.375rem',
              backdropFilter: 'blur(8px)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={curveColor} 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: curveColor, stroke: '#fff' }}
            className="motion-translate-y-in-[20px] motion-opacity-in-[0] motion-duration-[0.8s]"
          />
          {/* Current position dot */}
          <Line 
            type="monotone" 
            dataKey="currentMarker" 
            stroke="none"
            dot={{ 
              r: 6, 
              fill: '#10b981', 
              stroke: '#fff',
              strokeWidth: 2
            }}
            activeDot={false}
            className="motion-scale-in-[0.5] motion-opacity-in-[0] motion-duration-[0.8s] motion-delay-[0.3s]"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BondingCurveChart;