import React from 'react';

interface InfoBannerProps {
  isLiveMode: boolean;
}

export const InfoBanner: React.FC<InfoBannerProps> = ({ isLiveMode }) => {
  const dummyModeInfo = {
    title: "You are in Dummy Mode 🤖",
    text: "All transactions are simulated locally without using a real blockchain. This is for testing the UI and SDK integration.",
    borderColor: "border-slate-500",
    bgColor: "bg-slate-900/20",
    textColor: "text-slate-200"
  };

  const liveModeInfo = {
    title: "Connected to Sepolia Testnet �",
    text: "You are connected to the Ethereum Sepolia testnet. Real transactions require MetaMask and test ETH/ZAMA tokens.",
    borderColor: "border-green-500",
    bgColor: "bg-green-900/20",
    textColor: "text-green-200"
  };

  const info = isLiveMode ? liveModeInfo : dummyModeInfo;

  return (
    <div className={`p-4 rounded-lg border-l-4 mb-6 ${info.borderColor} ${info.bgColor}`}>
      <h3 className="font-bold text-white">{info.title}</h3>
      <p className={`text-sm ${info.textColor}`}>{info.text}</p>
    </div>
  );
};