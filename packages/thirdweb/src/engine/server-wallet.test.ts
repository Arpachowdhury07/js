import { beforeAll, describe, expect, it } from "vitest";
import { TEST_CLIENT } from "../../test/src/test-clients.js";
import { TEST_ACCOUNT_B } from "../../test/src/test-wallets.js";
import { typedData } from "../../test/src/typed-data.js";
import { arbitrumSepolia } from "../chains/chain-definitions/arbitrum-sepolia.js";
import { baseSepolia } from "../chains/chain-definitions/base-sepolia.js";
import { sepolia } from "../chains/chain-definitions/sepolia.js";
import { getContract } from "../contract/contract.js";
import { setContractURI } from "../extensions/common/__generated__/IContractMetadata/write/setContractURI.js";
import { mintTo } from "../extensions/erc20/write/mintTo.js";
import { claimTo } from "../extensions/erc1155/drops/write/claimTo.js";
import { getAllActiveSigners } from "../extensions/erc4337/__generated__/IAccountPermissions/read/getAllActiveSigners.js";
import { sendTransaction } from "../transaction/actions/send-transaction.js";
import {
  DEFAULT_ACCOUNT_FACTORY_V0_6,
  ENTRYPOINT_ADDRESS_v0_6,
} from "../wallets/smart/lib/constants.js";
import { smartWallet } from "../wallets/smart/smart-wallet.js";
import { generateAccount } from "../wallets/utils/generateAccount.js";
import * as Engine from "./index.js";

describe.runIf(
  process.env.TW_SECRET_KEY &&
    process.env.VAULT_TOKEN &&
    process.env.ENGINE_CLOUD_WALLET_ADDRESS &&
    process.env.ENGINE_CLOUD_WALLET_ADDRESS_EOA,
)(
  "Engine Cloud",
  {
    retry: 0,
  },
  () => {
    let serverWallet: Engine.ServerWallet;

    beforeAll(async () => {
      // setThirdwebDomains({
      //   rpc: "rpc.thirdweb-dev.com",
      //   storage: "storage.thirdweb-dev.com",
      //   bundler: "bundler.thirdweb-dev.com",
      //   engineCloud: "engine.thirdweb-dev.com",
      // });
      serverWallet = Engine.serverWallet({
        client: TEST_CLIENT,
        vaultAccessToken: process.env.VAULT_TOKEN as string,
        address: process.env.ENGINE_CLOUD_WALLET_ADDRESS as string,
        chain: arbitrumSepolia,
      });
    });

    it("should create a server wallet", async () => {
      const serverWallet = await Engine.createServerWallet({
        client: TEST_CLIENT,
        label: "My Server Wallet",
      });
      expect(serverWallet).toBeDefined();

      const serverWallets = await Engine.getServerWallets({
        client: TEST_CLIENT,
      });
      expect(serverWallets).toBeDefined();
      expect(serverWallets.length).toBeGreaterThan(0);
      expect(
        serverWallets.find((s) => s.address === serverWallet.address),
      ).toBeDefined();
    });

    it("should sign a message", async () => {
      const signature = await serverWallet.signMessage({
        message: "hello",
      });
      expect(signature).toBeDefined();
    });

    it("should sign typed data", async () => {
      const signature = await serverWallet.signTypedData({
        ...typedData.basic,
      });
      expect(signature).toBeDefined();
    });

    it("should send a tx with regular API", async () => {
      const tx = await sendTransaction({
        account: serverWallet,
        transaction: {
          client: TEST_CLIENT,
          chain: arbitrumSepolia,
          to: TEST_ACCOUNT_B.address,
          value: 0n,
        },
      });
      expect(tx).toBeDefined();
    });

    it("should enqueue a tx", async () => {
      const nftContract = getContract({
        client: TEST_CLIENT,
        chain: sepolia,
        address: "0xe2cb0eb5147b42095c2FfA6F7ec953bb0bE347D8",
      });
      const claimTx = claimTo({
        contract: nftContract,
        to: serverWallet.address,
        tokenId: 0n,
        quantity: 1n,
      });
      const result = await serverWallet.enqueueTransaction({
        transaction: claimTx,
      });
      expect(result.transactionId).toBeDefined();
      const txHash = await Engine.waitForTransactionHash({
        client: TEST_CLIENT,
        transactionId: result.transactionId,
      });
      expect(txHash.transactionHash).toBeDefined();

      const res = await Engine.searchTransactions({
        client: TEST_CLIENT,
        filters: [
          { field: "id", values: [result.transactionId], operation: "OR" },
        ],
      });
      expect(res).toBeDefined();
      expect(res.transactions.length).toBe(1);
      expect(res.transactions[0]?.id).toBe(result.transactionId);
    });

    it("should send a extension tx", async () => {
      const tokenContract = getContract({
        client: TEST_CLIENT,
        chain: baseSepolia,
        address: "0x87C52295891f208459F334975a3beE198fE75244",
      });
      const claimTx = mintTo({
        contract: tokenContract,
        to: serverWallet.address,
        amount: "0.001",
      });
      const tx = await sendTransaction({
        account: serverWallet,
        transaction: claimTx,
      });
      expect(tx).toBeDefined();
    });

    it("should enqueue a batch of txs", async () => {
      const tokenContract = getContract({
        client: TEST_CLIENT,
        chain: baseSepolia,
        address: "0x87C52295891f208459F334975a3beE198fE75244",
      });
      const claimTx1 = mintTo({
        contract: tokenContract,
        to: serverWallet.address,
        amount: "0.001",
      });
      const claimTx2 = mintTo({
        contract: tokenContract,
        to: serverWallet.address,
        amount: "0.002",
      });
      const tx = await serverWallet.enqueueBatchTransaction({
        transactions: [claimTx1, claimTx2],
      });
      expect(tx.transactionId).toBeDefined();
      const txHash = await Engine.waitForTransactionHash({
        client: TEST_CLIENT,
        transactionId: tx.transactionId,
      });
      expect(txHash.transactionHash).toBeDefined();
    });

    it("should get revert reason", async () => {
      const nftContract = getContract({
        client: TEST_CLIENT,
        chain: sepolia,
        address: "0xe2cb0eb5147b42095c2FfA6F7ec953bb0bE347D8",
      });
      const transaction = setContractURI({
        contract: nftContract,
        uri: "https://example.com",
        overrides: {
          gas: 1000000n, // skip simulation
        },
      });
      await expect(
        sendTransaction({
          account: serverWallet,
          transaction,
        }),
      ).rejects.toThrow();
    });

    it("should send a session key tx", async () => {
      const sessionKeyAccountAddress = process.env
        .ENGINE_CLOUD_WALLET_ADDRESS_EOA as string;
      const personalAccount = await generateAccount({
        client: TEST_CLIENT,
      });
      const smart = smartWallet({
        chain: sepolia,
        sponsorGas: true,
        sessionKey: {
          address: sessionKeyAccountAddress,
          permissions: {
            approvedTargets: "*",
          },
        },
      });
      const smartAccount = await smart.connect({
        client: TEST_CLIENT,
        personalAccount,
      });
      expect(smartAccount.address).toBeDefined();

      const signers = await getAllActiveSigners({
        contract: getContract({
          client: TEST_CLIENT,
          chain: sepolia,
          address: smartAccount.address,
        }),
      });
      expect(signers.map((s) => s.signer)).toContain(sessionKeyAccountAddress);

      const serverWallet = Engine.serverWallet({
        client: TEST_CLIENT,
        vaultAccessToken: process.env.VAULT_TOKEN as string,
        address: sessionKeyAccountAddress,
        chain: sepolia,
        executionOptions: {
          type: "ERC4337",
          signerAddress: sessionKeyAccountAddress,
          smartAccountAddress: smartAccount.address,
          factoryAddress: DEFAULT_ACCOUNT_FACTORY_V0_6,
          entrypointAddress: ENTRYPOINT_ADDRESS_v0_6,
        },
      });

      const tx = await sendTransaction({
        account: serverWallet,
        transaction: {
          client: TEST_CLIENT,
          chain: sepolia,
          to: TEST_ACCOUNT_B.address,
          value: 0n,
        },
      });
      expect(tx).toBeDefined();
    });
  },
);
