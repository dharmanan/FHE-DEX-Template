import React from 'react';

interface BalanceDisplayProps {
  ethBalance: number;
  tokenBalance: number;
  tokenSymbol: string;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ ethBalance, tokenBalance, tokenSymbol }) => {
  return (
    <div className="bg-neutral-900/50 backdrop-blur-sm p-5 rounded-xl border border-neutral-800">
      <h2 className="text-sm font-medium text-neutral-400 mb-4">Your Balances</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-neutral-700 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-neutral-300">
              <path fillRule="evenodd" d="M10.21 14.77a.75.75 0 0 1 .02-1.06L14.168 10 10.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M4.21 14.77a.75.75 0 0 1 .02-1.06L8.168 10 4.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="text-lg font-semibold text-neutral-100">{ethBalance.toFixed(4)} ETH</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-900/50 p-2 rounded-full">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow-400">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="text-lg font-semibold text-neutral-100">{tokenBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} {tokenSymbol}</div>
          </div>
        </div>
      </div>
    </div>
  );
};