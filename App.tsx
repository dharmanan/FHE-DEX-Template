import React from 'react';
import { Header } from './components/Header';
import { BalanceDisplay } from './components/BalanceDisplay';
import { DEXInterface } from './components/DEXInterface';
import { TransactionSummaryModal } from './components/TransactionSummaryModal';
import { useDEX } from './hooks/useDEX';
import { InfoBanner } from './components/InfoBanner';

export default function App() {
  const dex = useDEX();

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col items-center p-4 selection:bg-yellow-400 selection:text-neutral-900">
      <div className="w-full max-w-2xl mx-auto">
        <Header 
            isLiveMode={dex.isLiveMode} 
            setIsLiveMode={dex.setIsLiveMode}
            userAddress={dex.userAddress}
        />
        
        <main className="mt-8">
          <InfoBanner isLiveMode={dex.isLiveMode} />
          <BalanceDisplay
            ethBalance={dex.userEthBalance}
            tokenBalance={dex.userTokenBalance}
            tokenSymbol={dex.TOKEN_SYMBOL}
          />
          <DEXInterface dex={dex} />
        </main>
      </div>

      <TransactionSummaryModal
        isOpen={!!dex.transactionSummary}
        summary={dex.transactionSummary || ''}
        onClose={dex.clearTransactionSummary}
        isLoading={dex.isSummaryLoading}
      />

      <footer className="w-full max-w-2xl mx-auto text-center text-neutral-500 text-xs mt-12 pb-4">
        <p>Built as a showcase for the Universal FHEVM SDK.</p>
        <p>&copy; 2024. All rights reserved.</p>
      </footer>
    </div>
  );
}