import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";
import { goerli, mainnet, polygon, polygonMumbai } from "wagmi/chains";
import { configureChains, createClient } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

export const WALLET_CONNECT_PROJECT_ID = "1379342efcab34c54767f8cb561cc0fc";

export const chains = [mainnet, goerli, polygon, polygonMumbai];
export const pubProv = jsonRpcProvider({
  rpc: (polygonMumbai) => ({ http: `${polygonMumbai.rpcUrls.default}` }),
});
const { provider } = configureChains(
  chains,
  [
    walletConnectProvider({ projectId: WALLET_CONNECT_PROJECT_ID }),
    // pubProv,
  ],
  { targetQuorum: 2 }
);
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
