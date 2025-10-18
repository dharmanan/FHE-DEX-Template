/**
 * Main exports for Relayer SDK integration
 */

// Services
export { RelayerClient } from './services/relayerClient';
export { EncryptionService, encryptionUtils, createEncryptionService } from './services/encryptionService';

// Hooks
export { useRelayer } from './hooks/useRelayer';
export { useDEX } from './hooks/useDEX';

// Types
export type {
  EncryptedAmount,
  SwapParams,
  RelayerRequest,
  RelayerSubmitResponse,
  RelayerStatusResponse,
  DecryptedResult,
  OracleCallbackEvent,
  RelayerStatus,
  PendingSwap,
  RelayerConfig,
  EncryptionConfig,
  UseRelayerState,
  UseRelayerActions,
  UseRelayerHook,
} from './types/relayer';
