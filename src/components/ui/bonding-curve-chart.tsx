import React from 'react';
import { BondingCurveParams } from '@/lib/market-utils';

interface BondingCurveChartProps {
  params: BondingCurveParams;
  currentSupply: number;
  className?: string;
}

const BondingCurveChart: React.FC<BondingCurveChartProps> = ({ 
  params, 
  currentSupply, 
  className = '' 
}) => {
  // This is a placeholder component for the bonding curve chart
  // In a real implementation, this would use a charting library to visualize the curve
  return (
    <div className={`bonding-curve-chart bg-card/30 rounded-lg border border-border/50 flex flex-col items-center justify-center ${className}`}>
      <div className="text-sm text-muted-foreground px-4 py-6 text-center">
        <div className="font-medium mb-2">{params.curveType} Bonding Curve</div>
        <div className="text-xs mb-4">
          Initial Price: {params.initialPrice} SOL | 
          Current Supply: {currentSupply} / {params.maxSupply || '∞'}
        </div>
        
        {/* Simplified visualization */}
        <div className="w-full h-24 relative">
          <div className="absolute inset-0 flex items-end justify-start">
            {/* Generate curve visualization based on curve type */}
            {Array.from({ length: 10 }).map((_, i) => {
              let height = 0;
              
              switch (params.curveType) {
                case 'LINEAR':
                  // Linear growth
                  height = 10 + (i * 6);
                  break;
                case 'EXPONENTIAL':
                  // Exponential growth
                  height = 10 + (i * i);
                  break;
                case 'LOGARITHMIC':
                  // Logarithmic growth (faster initially, slower later)
                  height = 20 + (Math.log(i + 1) * 20);
                  break;
                case 'SIGMOID':
                  // S-curve (slow start, fast middle, slow end)
                  const x = ((i - 5) / 3);
                  const sigmoid = 1 / (1 + Math.exp(-x));
                  height = sigmoid * 70 + 10;
                  break;
                default:
                  height = 10 + (i * 6);
              }
              
              // Cap height to stay within container
              height = Math.min(height, 80);
              
              // Highlight current position
              const isCurrentPosition = i === Math.floor((currentSupply / (params.maxSupply || 1000)) * 10);
              
              return (
                <div
                  key={i}
                  className={`w-1/10 mx-0.5 ${isCurrentPosition ? 'bg-primary' : 'bg-primary/30'}`}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </div>
        
        <div className="text-xs mt-2">
          Current Price: {(params.initialPrice + ((params.delta || 0.01) * currentSupply)).toFixed(4)} SOL
        </div>
      </div>
    </div>
  );
};

export default BondingCurveChart;