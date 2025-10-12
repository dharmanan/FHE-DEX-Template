import React from 'react';

interface HeaderProps {
    isLiveMode: boolean;
    setIsLiveMode: (isLive: boolean) => void;
    userAddress: string | null;
}

const ToggleSwitch: React.FC<{isLiveMode: boolean, setIsLiveMode: (isLive: boolean) => void;}> = ({ isLiveMode, setIsLiveMode }) => {
    const handleToggle = () => setIsLiveMode(!isLiveMode);
    
    return (
        <div className="flex items-center space-x-2 text-sm">
            <span className={`font-medium ${!isLiveMode ? 'text-white' : 'text-neutral-500'}`}>Dummy</span>
            <button
                onClick={handleToggle}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950 focus:ring-yellow-500 ${
                isLiveMode ? 'bg-yellow-400' : 'bg-neutral-700'
                }`}
            >
                <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                    isLiveMode ? 'translate-x-6' : 'translate-x-1'
                }`}
                />
            </button>
            <span className={`font-medium ${isLiveMode ? 'text-yellow-400' : 'text-neutral-500'}`}>Live</span>
        </div>
    );
};

const WalletInfo: React.FC<{ userAddress: string | null; }> = ({ userAddress }) => {
    if (!userAddress) {
        return null;
    }
    const truncatedAddress = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    return (
        <div className="bg-neutral-800 text-sm text-neutral-300 font-mono px-3 py-2 rounded-lg" title={userAddress}>
            {truncatedAddress}
        </div>
    );
};

export const Header: React.FC<HeaderProps> = ({ isLiveMode, setIsLiveMode, userAddress }) => {
  return (
    <header className="flex justify-between items-center py-4">
      <div className="flex items-center space-x-3">
         <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" aria-hidden="true">
            <rect width="32" height="32" fill="#F4BE19" />
            <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill="#202020"
                fontSize="11"
                fontFamily="sans-serif"
                fontWeight="bold"
                letterSpacing="-0.5"
            >
                ZAMA
            </text>
        </svg>
        <h1 className="text-2xl font-bold text-neutral-100">
            ZAMA FHE DEX
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <ToggleSwitch isLiveMode={isLiveMode} setIsLiveMode={setIsLiveMode} />
        {isLiveMode && <WalletInfo userAddress={userAddress} />}
      </div>
    </header>
  );
};