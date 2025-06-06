// This file is auto-generated by @hey-api/openapi-ts

import type {
  Client,
  Options as ClientOptions,
  TDataShape,
} from "@hey-api/client-fetch";
import { client as _heyApiClient } from "./client.gen.js";
import type {
  CreateAccountData,
  CreateAccountResponse,
  EncodeFunctionDataData,
  EncodeFunctionDataResponse,
  GetNativeBalanceData,
  GetNativeBalanceResponse,
  GetTransactionAnalyticsData,
  GetTransactionAnalyticsResponse,
  GetTransactionAnalyticsSummaryData,
  GetTransactionAnalyticsSummaryResponse,
  ListAccountsData,
  ListAccountsResponse,
  ReadContractData,
  ReadContractResponse,
  SearchTransactionsData,
  SearchTransactionsResponse,
  SendTransactionData,
  SendTransactionResponse,
  SignMessageData,
  SignMessageResponse,
  SignTransactionData,
  SignTransactionResponse,
  SignTypedDataData,
  SignTypedDataResponse,
  WriteContractData,
  WriteContractResponse,
} from "./types.gen.js";

export type Options<
  TData extends TDataShape = TDataShape,
  ThrowOnError extends boolean = boolean,
> = ClientOptions<TData, ThrowOnError> & {
  /**
   * You can provide a client instance returned by `createClient()` instead of
   * individual options. This might be also useful if you want to implement a
   * custom client.
   */
  client?: Client;
  /**
   * You can pass arbitrary values through the `meta` object. This can be
   * used to access values that aren't defined as part of the SDK function.
   */
  meta?: Record<string, unknown>;
};

/**
 * List Server Wallets
 * List all engine server wallets for the current project. Returns an array of EOA addresses with their corresponding predicted smart account addresses.
 */
export const listAccounts = <ThrowOnError extends boolean = false>(
  options?: Options<ListAccountsData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).get<
    ListAccountsResponse,
    unknown,
    ThrowOnError
  >({
    security: [
      {
        name: "x-secret-key",
        type: "apiKey",
      },
    ],
    url: "/v1/accounts",
    ...options,
  });
};

/**
 * Create Server Wallet
 * Create a new engine server wallet. This is a helper route for creating a new EOA with your KMS provider, provided as a convenient alternative to creating an EOA directly with your KMS provider. Your KMS credentials are not stored, and usage of created accounts require your KMS credentials to be sent with requests.
 */
export const createAccount = <ThrowOnError extends boolean = false>(
  options?: Options<CreateAccountData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).post<
    CreateAccountResponse,
    unknown,
    ThrowOnError
  >({
    security: [
      {
        name: "x-secret-key",
        type: "apiKey",
      },
    ],
    url: "/v1/accounts",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Write Contract
 * Call a write function on a contract.
 */
export const writeContract = <ThrowOnError extends boolean = false>(
  options?: Options<WriteContractData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).post<
    WriteContractResponse,
    unknown,
    ThrowOnError
  >({
    security: [
      {
        name: "x-secret-key",
        type: "apiKey",
      },
    ],
    url: "/v1/write/contract",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Send Transaction
 * Send an encoded transaction or a batch of transactions
 */
export const sendTransaction = <ThrowOnError extends boolean = false>(
  options?: Options<SendTransactionData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).post<
    SendTransactionResponse,
    unknown,
    ThrowOnError
  >({
    security: [
      {
        name: "x-secret-key",
        type: "apiKey",
      },
    ],
    url: "/v1/write/transaction",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Sign Transaction
 * Sign transactions without sending them.
 */
export const signTransaction = <ThrowOnError extends boolean = false>(
  options?: Options<SignTransactionData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).post<
    SignTransactionResponse,
    unknown,
    ThrowOnError
  >({
    security: [
      {
        name: "x-secret-key",
        type: "apiKey",
      },
    ],
    url: "/v1/sign/transaction",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Sign Message
 * Sign arbitrary messages.
 */
export const signMessage = <ThrowOnError extends boolean = false>(
  options?: Options<SignMessageData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).post<
    SignMessageResponse,
    unknown,
    ThrowOnError
  >({
    security: [
      {
        name: "x-secret-key",
        type: "apiKey",
      },
    ],
    url: "/v1/sign/message",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Sign Typed Data
 * Sign EIP-712 typed data.
 */
export const signTypedData = <ThrowOnError extends boolean = false>(
  options?: Options<SignTypedDataData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).post<
    SignTypedDataResponse,
    unknown,
    ThrowOnError
  >({
    security: [
      {
        name: "x-secret-key",
        type: "apiKey",
      },
    ],
    url: "/v1/sign/typed-data",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Read Contract
 * Call read-only contract functions or batch read using multicall.
 */
export const readContract = <ThrowOnError extends boolean = false>(
  options?: Options<ReadContractData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).post<
    ReadContractResponse,
    unknown,
    ThrowOnError
  >({
    security: [
      {
        name: "x-secret-key",
        type: "apiKey",
      },
    ],
    url: "/v1/read/contract",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Read Native Balance
 * Fetches the native cryptocurrency balance (e.g., ETH, MATIC) for a given address on a specific chain.
 */
export const getNativeBalance = <ThrowOnError extends boolean = false>(
  options?: Options<GetNativeBalanceData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).post<
    GetNativeBalanceResponse,
    unknown,
    ThrowOnError
  >({
    security: [
      {
        name: "x-secret-key",
        type: "apiKey",
      },
    ],
    url: "/v1/read/balance",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Encode Function Data
 * Encode a contract call into transaction parameters (to, data, value).
 */
export const encodeFunctionData = <ThrowOnError extends boolean = false>(
  options?: Options<EncodeFunctionDataData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).post<
    EncodeFunctionDataResponse,
    unknown,
    ThrowOnError
  >({
    security: [
      {
        name: "x-secret-key",
        type: "apiKey",
      },
    ],
    url: "/v1/encode/contract",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Search Transactions
 * Advanced search for transactions with complex nested filters
 */
export const searchTransactions = <ThrowOnError extends boolean = false>(
  options?: Options<SearchTransactionsData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).post<
    SearchTransactionsResponse,
    unknown,
    ThrowOnError
  >({
    security: [
      {
        name: "x-secret-key",
        type: "apiKey",
      },
    ],
    url: "/v1/transactions/search",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Transaction Analytics
 * Get transaction count analytics over time with filtering
 */
export const getTransactionAnalytics = <ThrowOnError extends boolean = false>(
  options?: Options<GetTransactionAnalyticsData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).post<
    GetTransactionAnalyticsResponse,
    unknown,
    ThrowOnError
  >({
    security: [
      {
        name: "x-secret-key",
        type: "apiKey",
      },
    ],
    url: "/v1/transactions/analytics",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Transaction Analytics Summary
 * Get a summary (total count and total gas calculation) for transactions within a time range, supporting complex nested filters.
 */
export const getTransactionAnalyticsSummary = <
  ThrowOnError extends boolean = false,
>(
  options?: Options<GetTransactionAnalyticsSummaryData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).post<
    GetTransactionAnalyticsSummaryResponse,
    unknown,
    ThrowOnError
  >({
    security: [
      {
        name: "x-secret-key",
        type: "apiKey",
      },
    ],
    url: "/v1/transactions/analytics-summary",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};
