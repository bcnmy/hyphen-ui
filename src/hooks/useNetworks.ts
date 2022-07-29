import { config } from 'config';
import { useQuery } from 'react-query';

export type Network = {
  bridgeOpen: boolean;
  poolsOpen: boolean;
  enabled: boolean;
  nativeToken: string;
  nativeDecimal: number;
  eip1559Supported: boolean;
  baseFeeMultiplier: number;
  watchTower: string;
  networkAgnosticTransferSupported: boolean;
  tokenPriceToBeCalculated: boolean;
  sdkConfig: {
    metaTransactionSupported: boolean;
  };
  name: string;
  image: string;
  chainId: number;
  chainColor: string;
  currency: string;
  gasless: {
    enable: boolean;
    apiKey: string;
  };
  topicIds: {
    deposit: string;
    assetSent: string;
    routerSwapForEth: string;
  };
  graphUrl: string;
  v2GraphUrl: string;
  explorerUrl: string;
  rpc: string;
  contracts: {
    uniswapRouter: string;
    hyphen: {
      tokenManager: string;
      liquidityPool: string;
      executorManager: string;
      lpToken: string;
      liquidityProviders: string;
      liquidityFarming: string;
      liquidityFarmingV1: string;
      liquidityFarmingV2: string;
      whitelistPeriodManager: string;
    };
    biconomyForwarders: [string];
    gnosisMasterAccount: string;
    whiteListedExternalContracts: [string];
  };
};

const networksEndpoint = `${config.hyphen.baseURL}/api/v1/configuration/networks`;

function fetchNetworks(): Promise<Network[]> {
  return fetch(networksEndpoint)
    .then(res => res.json())
    .then(data =>
      data.message.filter(
        // Filter out networks which are not enabled and
        // have neither of bridgeOpen or poolsOpen booleans set to true.
        // When both bridgeOpen & poolsOpen booleans are false
        // the network is hidden across the whole app.
        (network: Network) =>
          network.enabled && (network.bridgeOpen || network.poolsOpen),
      ),
    );
}

function useNetworks() {
  return useQuery<Network[], Error>('networks', fetchNetworks);
}

export default useNetworks;
