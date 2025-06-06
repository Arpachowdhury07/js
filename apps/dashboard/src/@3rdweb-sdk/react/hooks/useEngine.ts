"use client";

import { apiServerProxy } from "@/actions/proxies";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { EngineBackendWalletType } from "lib/engine";
import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import invariant from "tiny-invariant";
import type { ResultItem } from "../../../app/(app)/team/[team_slug]/[project_slug]/(sidebar)/engine/dedicated/(instance)/[engineId]/metrics/components/StatusCodes";
import type { EngineStatus } from "../../../app/(app)/team/[team_slug]/[project_slug]/(sidebar)/engine/dedicated/(instance)/[engineId]/overview/components/transactions-table";
import { engineKeys } from "../cache-keys";

// Engine instances
export type EngineInstance = {
  id: string;
  accountId: string;
  name: string;
  url: string;
  lastAccessedAt: string;
  isCloudHosted: boolean;
  isPlanEngine: boolean;
  status:
    | "active"
    | "pending"
    | "requested"
    | "deploying"
    | "paymentFailed"
    | "deploymentFailed";
  deploymentId?: string;
};

// Not checking for null token because the token is required the tanstack useQuery hook
const getEngineRequestHeaders = (token: string | null): HeadersInit => {
  const basicHeaders = {
    "Content-Type": "application/json",
    // This is required to skip the browser warning when using ngrok
    // else, Engine -> Explorer doesn't work
    // more info: https://ngrok.com/abuse
    "ngrok-skip-browser-warning": "true",
  };
  if (!token) {
    return basicHeaders;
  }

  return {
    ...basicHeaders,
    Authorization: `Bearer ${token}`,
  };
};

// GET Requests
export type BackendWallet = {
  address: string;
  label?: string;
  type: EngineBackendWalletType;
  awsKmsKeyId?: string | null;
  awsKmsArn?: string | null;
  gcpKmsKeyId?: string | null;
  gcpKmsKeyRingId?: string | null;
  gcpKmsLocationId?: string | null;
  gcpKmsKeyVersionId?: string | null;
  gcpKmsResourcePath?: string | null;
};

export function useEngineBackendWallets(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  return useQuery({
    queryKey: [...engineKeys.backendWallets(instanceUrl), authToken],
    queryFn: async () => {
      const res = await fetch(`${instanceUrl}backend-wallet/get-all?limit=50`, {
        method: "GET",
        headers: getEngineRequestHeaders(authToken),
      });

      const json = await res.json();

      return (json.result as BackendWallet[]) || [];
    },
    enabled: !!instanceUrl,
  });
}

type EngineFeature =
  | "KEYPAIR_AUTH"
  | "CONTRACT_SUBSCRIPTIONS"
  | "IP_ALLOWLIST"
  | "HETEROGENEOUS_WALLET_TYPES"
  | "SMART_BACKEND_WALLETS"
  | "WALLET_CREDENTIALS";

interface EngineSystemHealth {
  status: string;
  engineVersion?: string;
  features?: EngineFeature[];
}

export function useEngineSystemHealth(
  instanceUrl: string,
  pollInterval: number | false = false,
) {
  return useQuery({
    queryKey: engineKeys.health(instanceUrl),
    queryFn: async () => {
      const res = await fetch(`${instanceUrl}system/health`, {
        headers: getEngineRequestHeaders(null),
      });
      if (!res.ok) {
        throw new Error(`Unexpected status ${res.status}: ${await res.text()}`);
      }
      const json = (await res.json()) as EngineSystemHealth;
      return json;
    },
    enabled: !!instanceUrl,
    refetchInterval: pollInterval,
  });
}

// Helper function to check if a feature is supported.
export function useHasEngineFeature(
  instanceUrl: string,
  feature: EngineFeature,
) {
  const query = useEngineSystemHealth(instanceUrl);
  return {
    query,
    isSupported: !!query.data?.features?.includes(feature),
  };
}

interface EngineSystemQueueMetrics {
  result: {
    queued: number;
    pending: number;
    latency?: {
      msToSend: { p50: number; p90: number };
      msToMine: { p50: number; p90: number };
    };
  };
}

export function useEngineQueueMetrics(params: {
  instanceUrl: string;
  pollInterval: number | false;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const pollInterval = params.pollInterval || false;

  return useQuery({
    queryKey: [...engineKeys.queueMetrics(instanceUrl), authToken],
    queryFn: async () => {
      const res = await fetch(`${instanceUrl}system/queue`, {
        headers: getEngineRequestHeaders(authToken),
      });
      if (!res.ok) {
        throw new Error(`Unexpected status ${res.status}: ${await res.text()}`);
      }
      return (await res.json()) as EngineSystemQueueMetrics;
    },
    refetchInterval: pollInterval,
  });
}

interface GetDeploymentPublicConfigurationInput {
  teamSlug: string;
}

interface DeploymentPublicConfigurationResponse {
  serverVersions: {
    name: string;
    createdAt: string;
  }[];
}

export function useEngineGetDeploymentPublicConfiguration(
  input: GetDeploymentPublicConfigurationInput,
) {
  return useQuery<DeploymentPublicConfigurationResponse>({
    queryKey: engineKeys.deploymentPublicConfiguration(),
    queryFn: async () => {
      const res = await apiServerProxy<{
        data: DeploymentPublicConfigurationResponse;
      }>({
        pathname: `/v1/teams/${input.teamSlug}/engine/deployments/public-configuration`,
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(res.error);
      }

      const json = res.data;
      return json.data;
    },
  });
}

interface UpdateDeploymentInput {
  teamSlug: string;
  deploymentId: string;
  serverVersion: string;
}

export function useEngineUpdateDeployment() {
  return useMutation({
    mutationFn: async (input: UpdateDeploymentInput) => {
      const res = await apiServerProxy({
        pathname: `/v1/teams/${input.teamSlug}/engine/deployments/${input.deploymentId}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serverVersion: input.serverVersion,
        }),
      });

      if (!res.ok) {
        throw new Error(res.error);
      }
    },
  });
}

export type RemoveEngineFromDashboardIParams = {
  instanceId: string;
  teamIdOrSlug: string;
};

export async function removeEngineFromDashboard({
  instanceId,
  teamIdOrSlug,
}: RemoveEngineFromDashboardIParams) {
  const res = await apiServerProxy({
    pathname: `/v1/teams/${teamIdOrSlug}/engine/${instanceId}`,
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(res.error);
  }
}

export type DeleteCloudHostedEngineParams = {
  deploymentId: string;
  reason: "USING_SELF_HOSTED" | "TOO_EXPENSIVE" | "MISSING_FEATURES" | "OTHER";
  feedback: string;
};

export async function deleteCloudHostedEngine({
  deploymentId,
  reason,
  feedback,
}: DeleteCloudHostedEngineParams) {
  const res = await apiServerProxy({
    pathname: `/v2/engine/deployments/${deploymentId}/infrastructure/delete`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason, feedback }),
  });

  if (!res.ok) {
    throw new Error(res.error);
  }
}

export type EditEngineInstanceParams = {
  teamIdOrSlug: string;
  instanceId: string;
  name: string;
  url: string;
};

export async function editEngineInstance({
  teamIdOrSlug,
  instanceId,
  name,
  url,
}: EditEngineInstanceParams) {
  const res = await apiServerProxy({
    pathname: `/v1/teams/${teamIdOrSlug}/engine/${instanceId}`,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, url }),
  });

  if (!res.ok) {
    throw new Error(res.error);
  }
}

export type Transaction = {
  queueId?: string | null;
  chainId?: string | null;
  fromAddress?: string | null;
  toAddress?: string | null;
  data?: string | null;
  extension?: string | null;
  value?: string | null;
  nonce?: number | null;
  gasLimit?: string | null;
  gasPrice?: string | null;
  maxFeePerGas?: string | null;
  maxPriorityFeePerGas?: string | null;
  effectiveGasPrice?: string | null;
  transactionType?: number | null;
  transactionHash?: string | null;
  queuedAt?: string | null;
  processedAt?: string | null;
  sentAt?: string | null;
  minedAt?: string | null;
  cancelledAt?: string | null;
  deployedContractAddress?: string | null;
  deployedContractType?: string | null;
  errorMessage?: string | null;
  sentAtBlockNumber?: number | null;
  blockNumber?: number | null;
  status?: string | null;
  retryCount: number;
  retryGasValues?: boolean | null;
  retryMaxFeePerGas?: string | null;
  retryMaxPriorityFeePerGas?: string | null;
  signerAddress?: string | null;
  accountAddress?: string | null;
  target?: string | null;
  sender?: string | null;
  initCode?: string | null;
  callData?: string | null;
  callGasLimit?: string | null;
  verificationGasLimit?: string | null;
  preVerificationGas?: string | null;

  paymasterAndData?: string | null;
  userOpHash?: string | null;
  functionName?: string | null;
  functionArgs?: string | null;
};

type TransactionResponse = {
  transactions: Transaction[];
  totalCount: number;
};

/**
 * Gets transactions for an Engine instance.
 *
 * @param instance
 * @param autoUpdate - If true, refetches every 4 seconds.
 * @returns
 */
export function useEngineTransactions(params: {
  instanceUrl: string;
  autoUpdate: boolean;
  authToken: string;
  queryParams?: {
    limit?: number;
    page?: number;
    status?: EngineStatus;
  };
}) {
  const { instanceUrl, autoUpdate, authToken } = params;

  return useQuery({
    queryKey: engineKeys.transactions(instanceUrl, params),
    queryFn: async () => {
      const url = new URL(`${instanceUrl}transaction/get-all`);
      if (params.queryParams) {
        for (const key in params.queryParams) {
          const value =
            params.queryParams[key as keyof typeof params.queryParams];
          if (value !== undefined) {
            url.searchParams.append(key, value.toString());
          }
        }
      }

      const res = await fetch(url, {
        method: "GET",
        headers: getEngineRequestHeaders(authToken),
      });

      const json = await res.json();

      return (json.result as TransactionResponse) || {};
    },
    refetchInterval: autoUpdate ? 4_000 : false,
    placeholderData: keepPreviousData,
  });
}

export interface WalletConfigResponse {
  type: EngineBackendWalletType;

  awsAccessKeyId?: string | null;
  awsRegion?: string | null;

  gcpApplicationProjectId?: string | null;
  gcpKmsLocationId?: string | null;
  gcpKmsKeyRingId?: string | null;
  gcpApplicationCredentialEmail?: string | null;
}

export function useEngineWalletConfig(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  return useQuery<WalletConfigResponse>({
    queryKey: engineKeys.walletConfig(instanceUrl),
    queryFn: async () => {
      const res = await fetch(`${instanceUrl}configuration/wallets`, {
        method: "GET",
        headers: getEngineRequestHeaders(authToken),
      });

      const json = await res.json();
      return json.result;
    },
    enabled: !!instanceUrl,
  });
}

type CurrencyValue = {
  name: string;
  symbol: string;
  decimals: number;
  value: string;
  displayValue: string;
};

export function useEngineBackendWalletBalance(params: {
  instanceUrl: string;
  address: string;
  authToken: string;
  chainId: number;
}) {
  const { instanceUrl, address, authToken, chainId } = params;

  return useQuery({
    queryKey: engineKeys.backendWalletBalance(address, chainId),
    queryFn: async () => {
      invariant(chainId, "chainId is required");

      const res = await fetch(
        `${instanceUrl}backend-wallet/${chainId}/${address}/get-balance`,
        {
          method: "GET",
          headers: getEngineRequestHeaders(authToken),
        },
      );

      const json = await res.json();

      return (json.result as CurrencyValue) || {};
    },
    enabled: !!instanceUrl && !!address && !!chainId,
  });
}

export type EngineAdmin = {
  walletAddress: string;
  label?: string;
  permissions: "OWNER" | "ADMIN";
};

export function useEnginePermissions(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const address = useActiveAccount()?.address;

  return useQuery({
    queryKey: engineKeys.permissions(instanceUrl),
    queryFn: async () => {
      const res = await fetch(`${instanceUrl}auth/permissions/get-all`, {
        method: "GET",
        headers: getEngineRequestHeaders(authToken),
      });

      if (res.status !== 200) {
        throw new Error(`${res.status}`);
      }

      const json = await res.json();

      return (json.result as EngineAdmin[]) || [];
    },

    enabled: !!instanceUrl && !!address,
  });
}

export type AccessToken = {
  id: string;
  tokenMask: string;
  walletAddress: string;
  createdAt: string;
  expiresAt: string;
  label?: string;
};

export function useEngineAccessTokens(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  return useQuery({
    queryKey: engineKeys.accessTokens(instanceUrl),
    queryFn: async () => {
      const res = await fetch(`${instanceUrl}auth/access-tokens/get-all`, {
        method: "GET",
        headers: getEngineRequestHeaders(authToken),
      });

      const json = await res.json();

      return (json.result as AccessToken[]) || [];
    },
    enabled: !!instanceUrl,
  });
}

export type KeypairAlgorithm = "ES256" | "RS256" | "PS256";

export type Keypair = {
  hash: string;
  label?: string;
  publicKey: string;
  algorithm: KeypairAlgorithm;
  createdAt: string;
  updatedAt: string;
};

export function useEngineKeypairs(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;

  return useQuery({
    queryKey: engineKeys.keypairs(instanceUrl),
    queryFn: async () => {
      const res = await fetch(`${instanceUrl}auth/keypair/get-all`, {
        method: "GET",
        headers: getEngineRequestHeaders(authToken),
      });

      const json = await res.json();

      return (json.result as Keypair[]) || [];
    },
    enabled: !!instanceUrl,
  });
}

type AddKeypairInput = {
  label?: string;
  publicKey: string;
  algorithm: string;
};

export function useEngineAddKeypair(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddKeypairInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}auth/keypair/add`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.keypairs(instanceUrl),
      });
    },
  });
}

type RemoveKeypairInput = {
  hash: string;
};

export function useEngineRemoveKeypair(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RemoveKeypairInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}auth/keypair/remove`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.keypairs(instanceUrl),
      });
    },
  });
}

export type EngineRelayer = {
  id: string;
  name?: string;
  chainId: string;
  backendWalletAddress: string;
  allowedContracts?: string[];
  allowedForwarders?: string[];
};

export function useEngineRelayer(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;

  return useQuery({
    queryKey: engineKeys.relayers(instanceUrl),
    queryFn: async () => {
      const res = await fetch(`${instanceUrl}relayer/get-all`, {
        method: "GET",
        headers: getEngineRequestHeaders(authToken),
      });

      const json = await res.json();

      return (json.result as EngineRelayer[]) || [];
    },
    enabled: !!instanceUrl,
  });
}

export type CreateRelayerInput = {
  name?: string;
  chain: string;
  backendWalletAddress: string;
  allowedContracts?: string[];
  allowedForwarders?: string[];
};

export function useEngineCreateRelayer(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRelayerInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}relayer/create`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.relayers(instanceUrl),
      });
    },
  });
}

type RevokeRelayerInput = {
  id: string;
};

export function useEngineRevokeRelayer(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RevokeRelayerInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}relayer/revoke`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.relayers(instanceUrl),
      });
    },
  });
}

export type UpdateRelayerInput = {
  id: string;
  name?: string;
  chain: string;
  backendWalletAddress: string;
  allowedContracts?: string[];
  allowedForwarders?: string[];
};

export function useEngineUpdateRelayer(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateRelayerInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}relayer/update`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.relayers(instanceUrl),
      });
    },
  });
}

export interface EngineWebhook {
  url: string;
  name: string;
  secret?: string | null;
  eventType: string;
  active: boolean;
  createdAt: string;
  id: number;
}

export function useEngineWebhooks(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;

  return useQuery({
    queryKey: engineKeys.webhooks(instanceUrl),
    queryFn: async () => {
      const res = await fetch(`${instanceUrl}webhooks/get-all`, {
        method: "GET",
        headers: getEngineRequestHeaders(authToken),
      });

      const json = await res.json();

      return (json.result as EngineWebhook[]) || [];
    },
    enabled: !!instanceUrl,
  });
}

// POST REQUESTS
export type SetWalletConfigInput =
  | {
      type: "aws-kms";
      awsAccessKeyId: string;
      awsSecretAccessKey: string;
      awsRegion: string;
    }
  | {
      type: "gcp-kms";
      gcpApplicationProjectId: string;
      gcpKmsLocationId: string;
      gcpKmsKeyRingId: string;
      gcpApplicationCredentialEmail: string;
      gcpApplicationCredentialPrivateKey: string;
    }
  | {
      type: "circle";
      circleApiKey: string;
    };

export function useEngineSetWalletConfig(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SetWalletConfigInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}configuration/wallets`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result as WalletConfigResponse;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.walletConfig(instanceUrl),
      });
    },
  });
}

export type CreateBackendWalletInput =
  | {
      type: Exclude<EngineBackendWalletType, "circle" | "smart:circle">;
      label?: string;
    }
  | {
      type: "circle" | "smart:circle";
      label?: string;
      credentialId: string;
      isTestnet: boolean;
    };

export function useEngineCreateBackendWallet(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBackendWalletInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}backend-wallet/create`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.backendWallets(instanceUrl),
      });
    },
  });
}

interface UpdateBackendWalletInput {
  walletAddress: string;
  label?: string;
}

export function useEngineUpdateBackendWallet(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateBackendWalletInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}backend-wallet/update`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.backendWallets(instanceUrl),
      });
    },
  });
}

// The backend determines the wallet imported based on the provided fields.
export type ImportBackendWalletInput = {
  label?: string;

  awsKmsArn?: string;

  gcpKmsKeyId?: string;
  gcpKmsKeyVersionId?: string;

  privateKey?: string;
  mnemonic?: string;
  encryptedJson?: string;
  password?: string;
};

export function useEngineImportBackendWallet(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ImportBackendWalletInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}backend-wallet/import`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.backendWallets(instanceUrl),
      });
    },
  });
}

interface DeleteBackendWalletInput {
  walletAddress: string;
}
export function useEngineDeleteBackendWallet(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteBackendWalletInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(
        `${instanceUrl}backend-wallet/${input.walletAddress}`,
        {
          method: "DELETE",
          headers: getEngineRequestHeaders(authToken),
        },
      );
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }
      return json.result;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.backendWallets(instanceUrl),
      });
    },
  });
}

export function useEngineGrantPermissions(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: EngineAdmin) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}auth/permissions/grant`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.permissions(instanceUrl),
      });
    },
  });
}

type RevokePermissionsInput = {
  walletAddress: string;
};

export function useEngineRevokePermissions(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RevokePermissionsInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}auth/permissions/revoke`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.permissions(instanceUrl),
      });
    },
  });
}

type CreateAccessTokenResponse = AccessToken & {
  accessToken: string;
};

export function useEngineCreateAccessToken(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}auth/access-tokens/create`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify({}),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result as CreateAccessTokenResponse;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.accessTokens(instanceUrl),
      });
    },
  });
}

type RevokeAccessTokenInput = {
  id: string;
};

export function useEngineRevokeAccessToken(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RevokeAccessTokenInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}auth/access-tokens/revoke`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.accessTokens(instanceUrl),
      });
    },
  });
}

type UpdateAccessTokenInput = {
  id: string;
  label?: string;
};

export function useEngineUpdateAccessToken(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateAccessTokenInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}auth/access-tokens/update`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.accessTokens(instanceUrl),
      });
    },
  });
}

export type CreateWebhookInput = {
  url: string;
  name: string;
  eventType: string;
};

export function useEngineCreateWebhook(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWebhookInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}webhooks/create`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.webhooks(instanceUrl),
      });
    },
  });
}

type DeleteWebhookInput = {
  id: number;
};
export function useEngineDeleteWebhook(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteWebhookInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}webhooks/revoke`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (json.error) {
        throw new Error(json.error.message);
      }
      return json.result;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.webhooks(instanceUrl),
      });
    },
  });
}

interface TestWebhookInput {
  id: number;
}
interface TestWebhookResponse {
  ok: boolean;
  status: number;
  body: string;
}
export function useEngineTestWebhook(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation<TestWebhookResponse, Error, TestWebhookInput>({
    mutationFn: async (input: TestWebhookInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}webhooks/${input.id}/test`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.error) {
        throw new Error(json.error.message);
      }
      return json.result;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.webhooks(instanceUrl),
      });
    },
  });
}

type SendTokensInput = {
  chainId: number;
  fromAddress: string;
  toAddress: string;
  amount: number;
  currencyAddress?: string;
};

export function useEngineSendTokens(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;

  return useMutation({
    mutationFn: async (input: SendTokensInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(
        `${instanceUrl}backend-wallet/${input.chainId}/transfer`,
        {
          method: "POST",
          headers: {
            ...getEngineRequestHeaders(authToken),
            "x-backend-wallet-address": input.fromAddress,
          },
          body: JSON.stringify({
            to: input.toAddress,
            amount: input.amount.toString(),
            currencyAddress: input.currencyAddress,
          }),
        },
      );
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },
  });
}

export function useEngineCorsConfiguration(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;

  return useQuery({
    queryKey: engineKeys.corsUrls(instanceUrl),
    queryFn: async () => {
      const res = await fetch(`${instanceUrl}configuration/cors`, {
        method: "GET",
        headers: getEngineRequestHeaders(authToken),
      });

      const json = await res.json();

      return (json.result as string[]) || [];
    },
  });
}

interface SetCorsUrlInput {
  urls: string[];
}

export function useEngineSetCorsConfiguration(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const queryClient = useQueryClient();
  const { instanceUrl, authToken } = params;

  return useMutation({
    mutationFn: async (input: SetCorsUrlInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}configuration/cors`, {
        method: "PUT",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.corsUrls(instanceUrl),
      });
    },
  });
}

export function useEngineIpAllowlistConfiguration(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;

  // don't bother sending requests that bounce
  // if engine instance is not updated to have IP_ALLOWLIST
  const { data: health } = useEngineSystemHealth(instanceUrl);

  return useQuery({
    queryKey: engineKeys.ipAllowlist(instanceUrl),
    queryFn: async () => {
      const res = await fetch(`${instanceUrl}configuration/ip-allowlist`, {
        method: "GET",
        headers: getEngineRequestHeaders(authToken),
      });

      const json = await res.json();
      return (json.result as string[]) || [];
    },

    enabled: health?.features?.includes("IP_ALLOWLIST"),
  });
}

interface SetIpAllowlistInput {
  ips: string[];
}

export function useEngineSetIpAllowlistConfiguration(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const queryClient = useQueryClient();
  const { instanceUrl, authToken } = params;

  return useMutation({
    mutationFn: async (input: SetIpAllowlistInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}configuration/ip-allowlist`, {
        method: "PUT",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.ipAllowlist(instanceUrl),
      });
    },
  });
}

export interface EngineContractSubscription {
  id: string;
  chainId: number;
  contractAddress: string;
  webhook?: EngineWebhook;
  createdAt: Date;
  processEventLogs: boolean;
  filterEvents: string[];
  processTransactionReceipts: boolean;
  filterFunctions: string[];

  // Dummy field for the table.
  lastIndexedBlock: string;
}

export function useEngineContractSubscription(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  return useQuery({
    queryKey: engineKeys.contractSubscriptions(instanceUrl),
    queryFn: async () => {
      const res = await fetch(`${instanceUrl}contract-subscriptions/get-all`, {
        method: "GET",
        headers: getEngineRequestHeaders(authToken),
      });

      const json = await res.json();
      return json.result as EngineContractSubscription[];
    },
  });
}

export interface AddContractSubscriptionInput {
  chain: string;
  contractAddress: string;
  webhookUrl: string;
  processEventLogs: boolean;
  filterEvents: string[];
  processTransactionReceipts: boolean;
  filterFunctions: string[];
}

export function useEngineAddContractSubscription(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddContractSubscriptionInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}contract-subscriptions/add`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.contractSubscriptions(instanceUrl),
      });
    },
  });
}

interface RemoveContractSubscriptionInput {
  contractSubscriptionId: string;
}

export function useEngineRemoveContractSubscription(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RemoveContractSubscriptionInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}contract-subscriptions/remove`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result;
    },

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.contractSubscriptions(instanceUrl),
      });
    },
  });
}

export function useEngineSubscriptionsLastBlock(params: {
  instanceUrl: string;
  chainId: number;
  autoUpdate: boolean;
  authToken: string;
}) {
  const { instanceUrl, chainId, autoUpdate, authToken } = params;

  return useQuery({
    queryKey: engineKeys.contractSubscriptionsLastBlock(instanceUrl, chainId),
    queryFn: async () => {
      const response = await fetch(
        `${instanceUrl}contract-subscriptions/last-block?chain=${chainId}`,
        {
          method: "GET",
          headers: getEngineRequestHeaders(authToken),
        },
      );

      const json = await response.json();
      return json.result.lastBlock as number;
    },
    enabled: !!instanceUrl,

    refetchInterval: autoUpdate ? 5_000 : false,
  });
}

interface EngineResourceMetrics {
  error: string;
  result: {
    cpu: number;
    memory: number;
    errorRate: ResultItem[];
    statusCodes: ResultItem[];
    requestVolume: ResultItem[];
  };
}

export function useEngineSystemMetrics(
  engineId: string,
  teamIdOrSlug: string,
  projectSlug: string,
) {
  const [enabled, setEnabled] = useState(true);

  return useQuery({
    queryKey: engineKeys.systemMetrics(engineId),
    queryFn: async () => {
      const res = await apiServerProxy({
        method: "GET",
        pathname: `/v1/teams/${teamIdOrSlug}/${projectSlug}/engine/dedicated/${engineId}/metrics`,
      });

      if (!res.ok) {
        setEnabled(false);
        throw new Error(res.error);
      }
      const json = res.data as EngineResourceMetrics;
      return json;
    },

    // Poll every 5s unless disabled.
    enabled,
    refetchInterval: 5_000,
  });
}

export interface EngineAlertRule {
  id: string;
  title: string;
  // A unique string identifying the alert.
  // Note the "." which allows `subscriptionRoutes` to use wildcards in notificationChannel.
  // Example: "alert.sla-5xx-99"
  routingKey: string;
  description: string;
  createdAt: Date;
  pausedAt: Date | null;
}

export function useEngineAlertRules(engineId: string, teamIdOrSlug: string) {
  return useQuery({
    queryKey: engineKeys.alertRules(engineId),
    queryFn: async () => {
      const res = await apiServerProxy<{
        data: EngineAlertRule[];
      }>({
        pathname: `/v1/teams/${teamIdOrSlug}/engine/${engineId}/alert-rules`,
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(res.error);
      }

      const json = res.data;
      return json.data;
    },
  });
}

export interface EngineAlert {
  id: string;
  alertRuleId: string;
  status: "pending" | "firing" | "resolved";
  startsAt: Date;
  endsAt: Date | null;
}

export function useEngineAlerts(
  engineId: string,
  teamIdOrSlug: string,
  limit: number,
  offset = 0,
) {
  return useQuery({
    queryKey: engineKeys.alerts(engineId),
    queryFn: async () => {
      const res = await apiServerProxy<{
        data: EngineAlert[];
      }>({
        pathname: `/v1/teams/${teamIdOrSlug}/engine/${engineId}/alerts`,
        searchParams: {
          limit: `${limit}`,
          offset: `${offset}`,
        },
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(res.error);
      }

      const json = res.data;
      return json.data;
    },
  });
}

export const EngineNotificationChannelTypeConfig = {
  slack: {
    display: "Slack",
    valueDisplay: "Slack Webhook URL",
  },
  email: {
    display: "Email",
    valueDisplay: "Email Address",
  },
} as const;

type EngineNotificationChannelType =
  keyof typeof EngineNotificationChannelTypeConfig;

export type EngineNotificationChannel = {
  id: string;
  type: EngineNotificationChannelType;
  value: string;
  createdAt: Date;
  pausedAt: Date | null;
  // A list of routingKeys to listen to. Supports wildcards.
  // Example: [ 'alert.sla-5xx-99' ] or [ 'alert.*' ] will both notify when
  // the alert with routingKey `alert.sla-5xx-99` triggers.
  subscriptionRoutes: string[];
};

export function useEngineNotificationChannels(
  engineId: string,
  teamIdOrSlug: string,
) {
  return useQuery({
    queryKey: engineKeys.notificationChannels(engineId),
    queryFn: async () => {
      const res = await apiServerProxy<{
        data: EngineNotificationChannel[];
      }>({
        pathname: `/v1/teams/${teamIdOrSlug}/engine/${engineId}/notification-channels`,
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(res.error);
      }

      const json = res.data;
      return json.data;
    },
  });
}

export interface CreateNotificationChannelInput {
  subscriptionRoutes: string[];
  type: "slack" | "email"; // TODO: Add others when implemented.
  value: string;
}

export function useEngineCreateNotificationChannel(
  engineId: string,
  teamIdOrSlug: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateNotificationChannelInput) => {
      const res = await apiServerProxy<{
        data: EngineNotificationChannel;
      }>({
        pathname: `/v1/teams/${teamIdOrSlug}/engine/${engineId}/notification-channels`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        throw new Error(res.error);
      }

      const json = res.data;
      return json.data;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.notificationChannels(engineId),
      });
    },
  });
}

export function useEngineDeleteNotificationChannel(
  engineId: string,
  teamIdOrSlug: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationChannelId: string) => {
      const res = await apiServerProxy({
        pathname: `/v1/teams/${teamIdOrSlug}/engine/${engineId}/notification-channels/${notificationChannelId}`,
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(res.error);
      }
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.notificationChannels(engineId),
      });
    },
  });
}

export interface WalletCredential {
  id: string;
  type: string;
  label: string;
  isDefault: boolean | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateWalletCredentialInput {
  type: "circle";
  label: string;
  entitySecret?: string;
  isDefault?: boolean;
}

export function useEngineWalletCredentials(params: {
  instanceUrl: string;
  authToken: string;
  page?: number;
  limit?: number;
}) {
  const { instanceUrl, authToken, page = 1, limit = 100 } = params;

  return useQuery({
    queryKey: [...engineKeys.walletCredentials(instanceUrl), page, limit],
    queryFn: async () => {
      const res = await fetch(
        `${instanceUrl}wallet-credentials?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: getEngineRequestHeaders(authToken),
        },
      );

      const json = await res.json();
      return (json.result as WalletCredential[]) || [];
    },
    enabled: !!instanceUrl,
  });
}

export function useEngineCreateWalletCredential(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWalletCredentialInput) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}wallet-credentials`, {
        method: "POST",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result as WalletCredential;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.walletCredentials(instanceUrl),
      });
    },
  });
}

interface UpdateWalletCredentialInput {
  label?: string;
  isDefault?: boolean;
  entitySecret?: string;
}

export function useEngineUpdateWalletCredential(params: {
  instanceUrl: string;
  authToken: string;
}) {
  const { instanceUrl, authToken } = params;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateWalletCredentialInput & { id: string }) => {
      invariant(instanceUrl, "instance is required");

      const res = await fetch(`${instanceUrl}wallet-credentials/${id}`, {
        method: "PUT",
        headers: getEngineRequestHeaders(authToken),
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.result as WalletCredential;
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: engineKeys.walletCredentials(instanceUrl),
      });
    },
  });
}
