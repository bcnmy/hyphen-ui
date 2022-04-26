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
    apiKey: string | null;
  };
  topicIds: {
    deposit: string;
    assetSent: string;
    routerSwapForEth: string;
  };
  graphUrl: string;
  v2GraphUrl: string;
  explorerUrl: string;
  rpc: string | null;
  contracts: {
    uniswapRouter: string;
    hyphen: {
      tokenManager: string | null;
      liquidityPool: string | null;
      executorManager: string | null;
      lpToken: string | null;
      liquidityProviders: string | null;
      liquidityFarming: string | null;
      whitelistPeriodManager: string | null;
    };
    biconomyForwarders: [string];
    gnosisMasterAccount: string | null;
    whiteListedExternalContracts: [string];
  };
};

function fetchNetworks(): Promise<Network[]> {
  return fetch(
    'http://hyphen-v2-staging-api.biconomy.io/api/v1/configuration/networks',
  )
    .then(res => res.json())
    .then(data =>
      Object.entries(data.message)
        .map(entry => {
          const [, value] = entry;
          return value as Network;
        })
        .filter(network => network.enabled),
    );
}

function useNetworks() {
  return useQuery<Network[], Error>('networks', fetchNetworks);
}

export default useNetworks;
