import React, { useState, useEffect } from 'react';
import type { UseDEXReturnType } from '../../types';

export interface SwapChartData {
  inputAmount: number;
  outputAmount: number;
  inputAsset: string;
}

interface SwapViewProps {
  dex: UseDEXReturnType;
  onInputChange: (data: SwapChartData) => void;
}


export const SwapView: React.FC<SwapViewProps> = ({ dex, onInputChange }) => {
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [inputAsset, setInputAsset] = useState<'ETH' | 'TOKEN'>('ETH');
  const [isSwapping, setIsSwapping] = useState(false);
  
  const outputAsset = inputAsset === 'ETH' ? 'TOKEN' : 'ETH';
  
  const inputSymbol = inputAsset === 'ETH' ? 'ETH' : dex.TOKEN_SYMBOL;
  const outputSymbol = outputAsset === 'ETH' ? 'ETH' : dex.TOKEN_SYMBOL;
  
  const userInBalance = inputAsset === 'ETH' ? dex.userEthBalance : dex.userTokenBalance;
  const userOutBalance = outputAsset === 'ETH' ? dex.userEthBalance : dex.userTokenBalance;

  useEffect(() => {
    const amount = parseFloat(inputAmount);
    let calculatedOutput = 0;

    if (!isNaN(amount) && amount > 0) {
      const k = dex.ethReserve * dex.tokenReserve;
      
      const fee = amount * 0.003;
      const amountAfterFee = amount - fee;

      if (inputAsset === 'ETH') {
        const newEthReserve = dex.ethReserve + amountAfterFee;
        const newTokenReserve = k / newEthReserve;
        calculatedOutput = dex.tokenReserve - newTokenReserve;
      } else { // input is TOKEN
        const newTokenReserve = dex.tokenReserve + amountAfterFee;
        const newEthReserve = k / newTokenReserve;
        calculatedOutput = dex.ethReserve - newEthReserve;
      }
    }
    
    const finalOutput = calculatedOutput > 0 ? calculatedOutput : 0;
    setOutputAmount(finalOutput > 0 ? finalOutput.toFixed(5) : '');
    onInputChange({
        inputAmount: amount || 0,
        outputAmount: finalOutput,
        inputAsset: inputSymbol,
    });

  }, [inputAmount, inputAsset, dex.ethReserve, dex.tokenReserve, dex.TOKEN_SYMBOL, onInputChange, inputSymbol]);

  // Monitor dex.isLoading and reset local swap state when done
  useEffect(() => {
    if (!dex.isLoading && isSwapping) {
      console.log('[SwapView] Swap completed, resetting state');
      setIsSwapping(false);
      setInputAmount('');
    }
  }, [dex.isLoading, isSwapping]);

  const handleSwap = () => {
    // Prevent multiple clicks
    if (isSwapping || dex.isLoading) {
      console.log('[SwapView] Swap already in progress, ignoring click');
      return;
    }

    const amount = parseFloat(inputAmount);
    if (!isNaN(amount) && amount > 0 && amount <= userInBalance) {
      console.log('[SwapView] Initiating swap', { amount, inputAsset });
      setIsSwapping(true);
      dex.swap(amount, inputAsset);
    }
  };

  const switchAssets = () => {
    setInputAmount(outputAmount);
    setInputAsset(prev => (prev === 'ETH' ? 'TOKEN' : 'ETH'));
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Input */}
      <div className="bg-neutral-800 p-3 rounded-lg">
        <div className="flex justify-between items-center text-xs text-neutral-400 mb-1">
          <span>You pay</span>
          <span>Balance: {userInBalance.toFixed(3)}</span>
        </div>
        <div className="flex justify-between items-center">
          <input
            type="number"
            placeholder="0.0"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            className="bg-transparent text-2xl font-mono w-full focus:outline-none"
          />
          <span className="font-semibold text-xl">{inputSymbol}</span>
        </div>
      </div>

      {/* Switch Button */}
      <div className="flex justify-center py-1">
        <button 
          onClick={switchAssets}
          className="p-2 rounded-full bg-neutral-700 hover:bg-neutral-600 transition-colors"
          aria-label="Switch assets"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-neutral-200">
            <path fillRule="evenodd" d="M14.77 10.23a.75.75 0 0 1-1.06 0L10 6.56l-3.71 3.67a.75.75 0 1 1-1.06-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06Zm-9.54-.46a.75.75 0 0 1 0 1.06L9 14.44l3.71-3.67a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L4.17 11.83a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Output */}
      <div className="bg-neutral-800 p-3 rounded-lg">
        <div className="flex justify-between items-center text-xs text-neutral-400 mb-1">
          <span>You receive (estimated)</span>
          <span>Balance: {userOutBalance.toFixed(3)}</span>
        </div>
        <div className="flex justify-between items-center">
          <input
            type="text"
            readOnly
            placeholder="0.0"
            value={outputAmount}
            className="bg-transparent text-2xl font-mono w-full focus:outline-none text-neutral-400"
          />
          <span className="font-semibold text-xl">{outputSymbol}</span>
        </div>
      </div>
      
      <div className="flex-grow"></div>

      <button
        onClick={handleSwap}
        disabled={isSwapping || dex.isLoading || !inputAmount || parseFloat(inputAmount) <= 0 || parseFloat(inputAmount) > userInBalance}
        className="w-full bg-yellow-400 text-neutral-900 font-bold py-3 rounded-lg hover:bg-yellow-300 transition-colors duration-200 disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed"
      >
        {isSwapping || dex.isLoading ? 'Processing...' : 'Swap'}
      </button>
    </div>
  );
};