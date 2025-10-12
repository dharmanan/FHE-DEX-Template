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
    title: "You are in Live Mode (Simulated) 📡",
    text: "This is a high-fidelity simulation. It uses ethers.js to mimic real blockchain interactions locally, without needing a wallet or connecting to a live network.",
    borderColor: "border-yellow-500",
    bgColor: "bg-yellow-900/20",
    textColor: "text-yellow-200"
  };

  const info = isLiveMode ? liveModeInfo : dummyModeInfo;

  return (
    <div className={`p-4 rounded-lg border-l-4 mb-6 ${info.borderColor} ${info.bgColor}`}>
      <h3 className="font-bold text-white">{info.title}</h3>
      <p className={`text-sm ${info.textColor}`}>{info.text}</p>
    </div>
  );
};