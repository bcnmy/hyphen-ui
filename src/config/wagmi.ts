import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";
import { goerli, mainnet, polygon, polygonMumbai } from "wagmi/chains";
import { configureChains, createClient } from "wagmi";

// FILL THIS IN WITH YOUR WALLET CONNECT PROJECT ID
export const WALLET_CONNECT_PROJECT_ID = "";

export const chains = [mainnet, goerli, polygon, polygonMumbai];
const { provider } = configureChains(chains, [
  walletConnectProvider({ projectId: WALLET_CONNECT_PROJECT_ID }),
]);
export const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({
    appName: "biconomy-sdk-dashboard",
    chains,
    projectId: WALLET_CONNECT_PROJECT_ID,
    version: "1",
  }),
  provider,
});
export const ethereumClient = new EthereumClient(wagmiClient, chains);
