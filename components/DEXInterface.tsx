import React, { useState, useCallback } from 'react';
import type { UseDEXReturnType } from '../types';
import { SwapView, SwapChartData } from './views/SwapView';
import { LiquidityView } from './views/LiquidityView';
import { AmmCurveChart } from './AmmCurveChart';

interface DEXInterfaceProps {
  dex: UseDEXReturnType;
}

type ActiveView = 'swap' | 'liquidity';

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    role="tab"
    aria-selected={isActive}
    className={`w-1/2 py-4 px-2 text-lg font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 rounded-t-xl ${
      isActive
        ? 'text-white bg-neutral-900/50'
        : 'text-neutral-400 bg-transparent hover:bg-neutral-900/40 hover:text-neutral-200'
    }`}
  >
    {label}
  </button>
);


export const DEXInterface: React.FC<DEXInterfaceProps> = ({ dex }) => {
  const [activeView, setActiveView] = useState<ActiveView>('swap');
  const [chartData, setChartData] = useState<SwapChartData>({
    inputAmount: 0,
    outputAmount: 0,
    inputAsset: 'ETH',
  });

  const handleSwapInputChange = useCallback((data: SwapChartData) => {
    setChartData(data);
  }, []);


  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
      {/* Left side: Tabbed interface for Swap/Liquidity */}
      <div className="lg:col-span-3 backdrop-blur-sm">
         <div className="flex" role="tablist">
            <TabButton label="Swap Tokens" isActive={activeView === 'swap'} onClick={() => setActiveView('swap')} />
            <TabButton label="Manage Liquidity" isActive={activeView === 'liquidity'} onClick={() => setActiveView('liquidity')} />
         </div>
        
        <div className="bg-neutral-900/50 p-5 rounded-b-xl border border-t-0 border-neutral-800" role="tabpanel">
            {activeView === 'swap' && <SwapView dex={dex} onInputChange={handleSwapInputChange} />}
            {activeView === 'liquidity' && <LiquidityView dex={dex} />}
        </div>
      </div>

      {/* Right side: AMM Curve Chart */}
      <div className="lg:col-span-2">
        <AmmCurveChart
          ethReserve={dex.ethReserve}
          tokenReserve={dex.tokenReserve}
          inputAmount={chartData.inputAmount}
          outputAmount={chartData.outputAmount}
          inputAsset={chartData.inputAsset}
        />
      </div>
    </div>
  );
};