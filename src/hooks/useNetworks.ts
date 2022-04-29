import { useQuery } from 'react-query';

export type Network = {
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
      whitelistPeriodManager: string;
    };
    biconomyForwarders: [string];
    gnosisMasterAccount: string;
    whiteListedExternalContracts: [string];
  };
};

function fetchNetworks(): Promise<Network[]> {
  return fetch(
    'http://hyphen-v2-staging-api.biconomy.io/api/v1/configuration/networks',
  )
    .then(res => res.json())
    .then(data => data.message.filter((network: Network) => network.enabled));
}

function useNetworks() {
  return useQuery<Network[], Error>('networks', fetchNetworks);
}

export default useNetworks;
