import config from 'config';
import { useQuery } from 'react-query';
import useNetworks from './useNetworks';

export type Token = {
  symbol: string;
  color: string;
  image: string;
  coinGeckoId: string;
  [chainId: number]: {
    address: string;
    transferOverhead: number;
    decimal: number;
    symbol: string;
    chainColor: string;
    isSupported?: boolean;
    isSupportedOnBridge: boolean;
    isSupportedOnPool: boolean;
    metaTransactionData: {
      supportsEip2612: boolean;
      eip2612Data: {
        name: string;
        version: number;
        chainId: number;
      };
    };
  };
};

const tokensEndpoint = `${config.hyphen.baseURL}/api/v1/configuration/tokens`;

function fetchTokens(): Promise<{
  [key: string]: Token;
}> {
  return fetch(tokensEndpoint)
    .then(res => res.json())
    .then(data =>
      data.message.reduce((acc: any, token: Token) => {
        const { symbol } = token;
        return {
          ...acc,
          [symbol]: token,
        };
      }, {}),
    );
}

function useTokens() {
  const { data: networks } = useNetworks();

  return useQuery<
    {
      [key: string]: Token;
    },
    Error
  >('tokens', fetchTokens, {
    enabled: !!networks,
  });
}

export default useTokens;
