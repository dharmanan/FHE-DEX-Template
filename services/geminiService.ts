import { GoogleGenAI } from "@google/genai";
import type { TransactionDetails } from '../types';
import { TOKEN_SYMBOL } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI | null;

  constructor() {
    if (!process.env.API_KEY) {
      console.warn("API_KEY environment variable not set. GeminiService will be disabled.");
      this.ai = null;
    } else {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
  }

  private createPrompt(details: TransactionDetails): string {
    const { type, inputAsset, inputAmount, outputAsset, outputAmount } = details;
    const formattedInputAmount = inputAmount.toFixed(4);
    const formattedOutputAmount = outputAmount.toFixed(4);

    switch (type) {
      case 'swap':
        return `
You are a crypto assistant who explains confidential transactions.
Your response MUST be in Markdown format and very concise (2-3 sentences max). Use emojis.

## 🎉 Swap Successful!

You've swapped **${formattedInputAmount} ${inputAsset}** for **${formattedOutputAmount} ${outputAsset}**.

This confidential transaction was secured by FHEVM, keeping your swap amounts private on the blockchain. 🛡️
`;
      case 'deposit':
        return `
You are a crypto assistant who explains confidential transactions.
Your response MUST be in Markdown format and very concise (2-3 sentences max). Use emojis.

## 💧 Liquidity Added!

You've deposited **${formattedInputAmount} ${inputAsset}** and **${formattedOutputAmount} ${outputAsset}** to the pool.

Your contribution details are kept private on-chain through this confidential FHEVM transaction.
`;
      case 'withdraw':
        return `
You are a crypto assistant who explains confidential transactions.
Your response MUST be in Markdown format and very concise (2-3 sentences max). Use emojis.

## 🌊 Liquidity Withdrawn!

You've successfully redeemed **${formattedInputAmount} LP Tokens**.

The corresponding amounts of ETH and ${TOKEN_SYMBOL} were transferred privately to your wallet in this confidential FHEVM transaction. 🔐
`;
    }
    return `Transaction type ${type} summary requested.`;
  }

  public async generateTransactionSummary(details: TransactionDetails): Promise<string> {
    if (!this.ai) {
        return Promise.resolve(`
## ✅ Transaction Processed (Dummy)

- **Type**: ${details.type}
- **Input**: ${details.inputAmount.toFixed(4)} ${details.inputAsset}
- **Output**: ${details.outputAmount.toFixed(4)} ${details.outputAsset}

*Gemini summary is disabled (API key not set).*
`);
    }

    try {
      const prompt = this.createPrompt(details);
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error generating summary with Gemini:", error);
      return "## ⚠️ AI Summary Error\n\nCould not generate a summary for this transaction. Please check the transaction details manually.";
    }
  }
}