import React from 'react';

interface AmmCurveChartProps {
  ethReserve: number;
  tokenReserve: number;
  inputAmount?: number;
  outputAmount?: number;
  inputAsset?: 'ETH' | string;
}

export const AmmCurveChart: React.FC<AmmCurveChartProps> = ({
  ethReserve,
  tokenReserve,
  inputAmount = 0,
  outputAmount = 0,
  inputAsset = 'ETH',
}) => {
  const k = ethReserve * tokenReserve;
  if (k <= 0) return null;

  const width = 300;
  const height = 200;
  const padding = 30;

  const maxEth = ethReserve * 2;
  const maxToken = tokenReserve * 2;

  const xScale = (x: number) => (x / maxEth) * (width - padding * 2) + padding;
  const yScale = (y: number) => height - ((y / maxToken) * (height - padding * 2) + padding);

  const points = Array.from({ length: 101 }, (_, i) => {
    const x = (maxEth / 100) * i;
    if (x === 0) return null;
    const y = k / x;
    if (y > maxToken * 1.5) return null;
    return `${xScale(x)},${yScale(y)}`;
  }).filter(Boolean).join(' ');

  const currentX = xScale(ethReserve);
  const currentY = yScale(tokenReserve);

  let newEthReserve = ethReserve;
  let newTokenReserve = tokenReserve;

  // We need to calculate the new reserve state based on the potential swap
  if (inputAmount > 0 && outputAmount > 0) {
    // The swap fee is 0.3% of the input amount. The amount added to the pool is after the fee.
    const fee = inputAmount * 0.003;
    const inputAmountAfterFee = inputAmount - fee;

    if (inputAsset === 'ETH') {
      newEthReserve = ethReserve + inputAmountAfterFee;
      newTokenReserve = tokenReserve - outputAmount;
    } else {
      newEthReserve = ethReserve - outputAmount;
      newTokenReserve = tokenReserve + inputAmountAfterFee;
    }
  }

  const newX = xScale(newEthReserve);
  const newY = yScale(newTokenReserve);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-neutral-900/50 rounded-lg">
      <h3 className="text-sm font-semibold text-neutral-300 mb-2">AMM Liquidity Curve (x * y = k)</h3>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding/2} y2={height - padding} stroke="#404040" strokeWidth="1" />
        <line x1={padding} y1={padding/2} x2={padding} y2={height - padding} stroke="#404040" strokeWidth="1" />
        <text x={width / 2} y={height - 5} fontSize="10" fill="#a3a3a3" textAnchor="middle">ETH Reserve</text>
        <text x={10} y={height / 2} fontSize="10" fill="#a3a3a3" transform={`rotate(-90, 10, ${height/2})`} textAnchor="middle">Token Reserve</text>

        {/* Curve */}
        <polyline
          fill="none"
          stroke="url(#curveGradient)"
          strokeWidth="2"
          points={points}
        />
        <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#FBBF24', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#FDE68A', stopOpacity: 0.8}} />
            </linearGradient>
        </defs>

        {/* Current Point */}
        <circle cx={currentX} cy={currentY} r="4" fill="#FBBF24" />
        <g transform={`translate(${currentX + 8}, ${currentY - 8})`}>
          <text fontSize="10" fill="#e2e8f0">Current</text>
        </g>
        
        {/* New Point */}
        {inputAmount > 0 && newX > 0 && newY > 0 && (
          <>
            <circle cx={newX} cy={newY} r="4" fill="#f43f5e" />
             <g transform={`translate(${newX + 8}, ${newY - 8})`}>
                <text fontSize="10" fill="#e2e8f0">New</text>
             </g>
             <line x1={currentX} y1={currentY} x2={newX} y2={newY} strokeDasharray="3 3" stroke="#a3a3a3" />
          </>
        )}
      </svg>
    </div>
  );
};