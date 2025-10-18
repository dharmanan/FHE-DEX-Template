import React from 'react';

interface HeaderProps {
    isLiveMode: boolean;
    setIsLiveMode: (isLive: boolean) => void;
    userAddress: string | null;
    chainId: number | null;
    onConnectWallet: () => Promise<void>;
    onDisconnectWallet: () => void;
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

const getNetworkName = (chainId: number | null): string => {
  if (!chainId) return "Not Connected";
  switch (chainId) {
    case 11155111:
      return "Sepolia";
    case 1:
      return "Mainnet";
    case 5:
      return "Goerli";
    default:
      return `Chain ${chainId}`;
  }
};

const WalletSection: React.FC<{ 
  userAddress: string | null; 
  chainId: number | null;
  onConnectWallet: () => Promise<void>;
  onDisconnectWallet: () => void;
}> = ({ userAddress, chainId, onConnectWallet, onDisconnectWallet }) => {
    if (!userAddress) {
        return (
            <button
                onClick={onConnectWallet}
                className="px-4 py-2 bg-yellow-400 text-neutral-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors text-sm"
            >
                Connect Wallet
            </button>
        );
    }

    const truncatedAddress = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    const networkName = getNetworkName(chainId);
    const isWrongNetwork = chainId && chainId !== 11155111;

    return (
        <div className="flex items-center space-x-3">
            {/* Network Badge */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-mono ${
                isWrongNetwork 
                    ? 'bg-red-900/30 border border-red-500 text-red-200'
                    : 'bg-green-900/30 border border-green-500 text-green-200'
            }`}>
                <div className={`w-2 h-2 rounded-full ${isWrongNetwork ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span>{networkName}</span>
            </div>

            {/* Wallet Address */}
            <div className="bg-neutral-800 text-neutral-300 font-mono px-3 py-2 rounded-lg text-sm" title={userAddress}>
                {truncatedAddress}
            </div>

            {/* Dropdown Menu */}
            <div className="relative group">
                <button className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-sm font-semibold text-neutral-200 transition-colors">
                    ⋮
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <button
                        onClick={onConnectWallet}
                        className="block w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-yellow-400 rounded-t-lg transition-colors"
                    >
                        🔄 Connect Different Wallet
                    </button>
                    <div className="border-t border-neutral-700"></div>
                    <button
                        onClick={onDisconnectWallet}
                        className="block w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-red-400 rounded-b-lg transition-colors"
                    >
                        🔌 Disconnect
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Header: React.FC<HeaderProps> = ({ isLiveMode, setIsLiveMode, userAddress, chainId, onConnectWallet, onDisconnectWallet }) => {
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
        {isLiveMode && <WalletSection userAddress={userAddress} chainId={chainId} onConnectWallet={onConnectWallet} onDisconnectWallet={onDisconnectWallet} />}
      </div>
    </header>
  );
};