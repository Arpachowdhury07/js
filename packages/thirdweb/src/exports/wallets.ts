// --- KEEEP IN SYNC with exports/wallets.native.ts ---

export {
  createWallet,
  walletConnect,
} from "../wallets/create-wallet.js";
export {
  inAppWallet,
  /**
   * @deprecated use inAppWallet instead
   */
  inAppWallet as embeddedWallet,
} from "../wallets/in-app/web/in-app.js";
export { ecosystemWallet } from "../wallets/in-app/web/ecosystem.js";
export type {
  EcosystemWalletCreationOptions,
  EcosystemWalletConnectionOptions,
  EcosystemWalletAutoConnectOptions,
} from "../wallets/ecosystem/types.js";
export { smartWallet } from "../wallets/smart/smart-wallet.js";

export type { Wallet, Account } from "../wallets/interfaces/wallet.js";
export type { ConnectionStatus } from "../wallets/manager/index.js";

// utils
export {
  getWalletBalance,
  type GetWalletBalanceOptions,
} from "../wallets/utils/getWalletBalance.js";
export {
  generateAccount,
  type GenerateAccountOptions,
} from "../wallets/utils/generateAccount.js";

// private-key
export {
  privateKeyToAccount,
  /**
   * @internal
   * @deprecated - use {@link privateKeyToAccount} instead
   */
  privateKeyToAccount as privateKeyAccount,
  type PrivateKeyToAccountOptions,
  /**
   * @internal
   * @deprecated - use {@link PrivateKeyToAccountOptions} instead
   */
  type PrivateKeyToAccountOptions as PrivateKeyAccountOptions,
} from "../wallets/private-key.js";
// generate a random private key
export { randomPrivateKey } from "ox/Secp256k1";

export type {
  WalletId,
  WalletAutoConnectionOption,
  WalletCreationOptions,
  WalletConnectionOption,
  CreateWalletArgs,
  InjectedConnectOptions,
  DeepLinkSupportedWalletCreationOptions,
  StandaloneWCConnectOptions,
} from "../wallets/wallet-types.js";

export type {
  WCSupportedWalletIds,
  InjectedSupportedWalletIds,
} from "../wallets/__generated__/wallet-ids.js";

export type {
  WCConnectOptions,
  WCAutoConnectOptions,
} from "../wallets/wallet-connect/types.js";

export type {
  SmartWalletConnectionOptions,
  SmartWalletOptions,
} from "../wallets/smart/types.js";

export type {
  WalletUser,
  InAppWalletAuth,
  /**
   * @deprecated use InAppWalletAuth instead
   */
  InAppWalletAuth as EmbeddedWalletAuth,
  InAppWalletAutoConnectOptions,
  /**
   * @deprecated use InAppWalletAutoConnectOptions instead
   */
  InAppWalletAutoConnectOptions as EmbeddedWalletAutoConnectOptions,
  InAppWalletConnectionOptions,
  /**
   * @deprecated use InAppWalletConnectionOptions instead
   */
  InAppWalletConnectionOptions as EmbeddedWalletConnectionOptions,
  InAppWalletSocialAuth,
  /**
   * @deprecated use InAppWalletSocialAuth instead
   */
  InAppWalletSocialAuth as EmbeddedWalletSocialAuth,
  InAppWalletCreationOptions,
} from "../wallets/in-app/core/wallet/types.js";

export type {
  MultiStepAuthArgsType,
  SingleStepAuthArgsType,
} from "../wallets/in-app/core/authentication/types.js";

export {
  preAuthenticate,
  authenticate,
  authenticateWithRedirect,
  getUserEmail,
  getUserPhoneNumber,
  getProfiles,
  linkProfile,
  unlinkProfile,
} from "../wallets/in-app/web/lib/auth/index.js";
export type { Profile } from "../wallets/in-app/core/authentication/types.js";

export {
  getUser,
  type GetUserResult,
} from "../wallets/in-app/core/users/getUser.js";

export type {
  CoinbaseWalletCreationOptions,
  CoinbaseSDKWalletConnectionOptions,
} from "../wallets/coinbase/coinbase-web.js";

export type {
  WalletEmitter,
  WalletEmitterEvents,
} from "../wallets/wallet-emitter.js";

export { getAllWalletsList } from "../wallets/getAllWalletsList.js";
export { getWalletInfo } from "../wallets/__generated__/getWalletInfo.js";
export type { WalletInfo } from "../wallets/wallet-info.js";

export { createWalletAdapter } from "../adapters/wallet-adapter.js";
export type { AdapterWalletOptions } from "../adapters/wallet-adapter.js";

// wallet connect
export {
  createWalletConnectClient,
  createWalletConnectSession,
  disconnectWalletConnectSession,
  getActiveWalletConnectSessions,
  DefaultWalletConnectRequestHandlers,
} from "../wallets/wallet-connect/receiver/index.js";
export type {
  WalletConnectClient,
  WalletConnectSession,
} from "../wallets/wallet-connect/receiver/types.js";

// eip1193
export * as EIP1193 from "../adapters/eip1193/index.js";

// WEB ONLY EXPORTS

// injected
export { injectedProvider } from "../wallets/injected/mipdStore.js";
export { getInstalledWallets } from "../wallets/injected/mipdStore.js";

export type { ConnectionManager } from "../wallets/manager/index.js";

export type { AutoConnectProps } from "../wallets/connection/types.js";
export { autoConnect } from "../wallets/connection/autoConnect.js";
export { deploySmartAccount } from "../wallets/smart/lib/signing.js";
