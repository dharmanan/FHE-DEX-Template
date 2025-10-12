import React, { useState, useEffect } from 'react';
import type { UseDEXReturnType } from '../../types';

export const LiquidityView: React.FC<{ dex: UseDEXReturnType }> = ({ dex }) => {
  const [depositEthAmount, setDepositEthAmount] = useState('');
  const [depositTokenAmount, setDepositTokenAmount] = useState('');
  const [withdrawLpAmount, setWithdrawLpAmount] = useState('');

  useEffect(() => {
    const amount = parseFloat(depositEthAmount);
    if (!isNaN(amount) && amount > 0 && dex.ethReserve > 0) {
      const tokenAmount = (amount / dex.ethReserve) * dex.tokenReserve;
      setDepositTokenAmount(tokenAmount.toFixed(3));
    } else {
      setDepositTokenAmount('');
    }
  }, [depositEthAmount, dex.ethReserve, dex.tokenReserve]);

  const handleDeposit = () => {
    const amount = parseFloat(depositEthAmount);
    if (!isNaN(amount) && amount > 0) {
      dex.deposit(amount);
      setDepositEthAmount('');
    }
  };

  const handleWithdraw = () => {
    const amount = Number(withdrawLpAmount);
    // Pozitif ve sayısal değer kontrolü
    if (!isNaN(amount) && amount > 0) {
      dex.withdraw(amount);
      setWithdrawLpAmount('');
    } else {
      alert('Lütfen geçerli bir LP miktarı girin.');
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Your Liquidity */}
      <div className="text-center bg-neutral-900/50 p-3 rounded-lg">
        <h3 className="text-neutral-400 text-sm">Your Liquidity Pool Tokens</h3>
        <p className="text-2xl font-bold font-mono text-yellow-400">{dex.userLiquidity.toFixed(4)}</p>
         <p className="text-xs text-neutral-500 mt-1">Pool Reserves: {dex.ethReserve.toFixed(2)} ETH / {dex.tokenReserve.toLocaleString(undefined, { maximumFractionDigits: 0 })} {dex.TOKEN_SYMBOL}</p>
      </div>

      {/* Deposit Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Add Liquidity</h3>
        <div className="bg-neutral-800 p-3 rounded-lg">
          <div className="flex justify-between items-center text-xs text-neutral-400 mb-1">
            <span>ETH Amount</span>
            <span>Balance: {dex.userEthBalance.toFixed(3)}</span>
          </div>
          <input
              type="number"
              placeholder="0.0"
              value={depositEthAmount}
              onChange={(e) => setDepositEthAmount(e.target.value)}
              className="bg-transparent text-xl font-mono w-full focus:outline-none"
            />
        </div>
        <div className="bg-neutral-800 p-3 rounded-lg">
          <div className="flex justify-between items-center text-xs text-neutral-400 mb-1">
            <span>{dex.TOKEN_SYMBOL} Amount (Proportional)</span>
          </div>
          <input
            type="text"
            readOnly
            placeholder="0.0"
            value={depositTokenAmount}
            className="bg-transparent text-xl font-mono w-full focus:outline-none text-neutral-400"
          />
        </div>
        <button
          onClick={handleDeposit}
          disabled={dex.isLoading || !depositEthAmount || parseFloat(depositEthAmount) <= 0 || parseFloat(depositTokenAmount) > dex.userTokenBalance}
          className="w-full bg-yellow-400 text-neutral-900 font-bold py-2.5 rounded-lg hover:bg-yellow-300 transition-colors duration-200 disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed"
        >
          {dex.isLoading ? 'Processing...' : 'Deposit'}
        </button>
      </div>

      {/* Withdraw Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Withdraw Liquidity</h3>
        <div className="bg-neutral-800 p-3 rounded-lg">
          <div className="flex justify-between items-center text-xs text-neutral-400 mb-1">
            <span>LP Token Amount</span>
            <span>Balance: {dex.userLiquidity.toFixed(4)}</span>
          </div>
          <input
            type="number"
            placeholder="0.0"
            value={withdrawLpAmount}
            onChange={(e) => setWithdrawLpAmount(e.target.value)}
            className="bg-transparent text-xl font-mono w-full focus:outline-none"
          />
        </div>
        <button
          onClick={handleWithdraw}
          disabled={dex.isLoading || !withdrawLpAmount || Number(withdrawLpAmount) <= 0 || Number(withdrawLpAmount) > dex.userLiquidity}
          className="w-full bg-neutral-700 text-white font-semibold py-2.5 rounded-lg hover:bg-neutral-600 transition-colors duration-200 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed"
        >
          {dex.isLoading ? 'Processing...' : 'Withdraw'}
        </button>
      </div>
    </div>
  );
};