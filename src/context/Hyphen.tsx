import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// @ts-ignore
import { Hyphen, SIGNATURE_TYPES } from '@biconomy/hyphen';

import { useWalletProvider } from './WalletProvider';
import { useChains } from './Chains';
import { useToken } from './Token';
import useAsync, { Status } from 'hooks/useLoading';
import { useBiconomy } from './Biconomy';
import { ENV } from 'types/environment';
import { Environment } from '@biconomy/hyphen/dist/types';

type PoolInfo = {
  minDepositAmount: number;
  maxDepositAmount: number;
  fromLPManagerAddress: string;
  toLPManagerAddress: string;
};

interface IHyphenContext {
  hyphen: any;
  poolInfo: PoolInfo | undefined;
  getPoolInfoStatus: Status;
}

const HyphenContext = createContext<IHyphenContext | null>(null);

const HyphenProvider: React.FC = props => {
  const { rawEthereumProvider, walletProvider } = useWalletProvider()!;
  const { selectedToken } = useToken()!;
  const { isBiconomyEnabled } = useBiconomy()!;
  const { fromChainRpcUrlProvider, fromChain, toChain, areChainsReady } =
    useChains()!;
  const [hyphen, setHyphen] = useState<any>(undefined);

  useEffect(() => {
    async function initHyphen(isBiconomyEnabled: boolean) {
      if (!rawEthereumProvider || !walletProvider || !fromChainRpcUrlProvider)
        return;

      let hyphenObj;
      if (isBiconomyEnabled) {
        hyphenObj = new Hyphen(fromChainRpcUrlProvider, {
          debug: true,
          infiniteApproval: true,
          environment: {
            [ENV.production]: 'prod',
            [ENV.test]: 'test',
            [ENV.staging]: 'staging',
            local: '',
          }[process.env.REACT_APP_ENV] as Environment,
          biconomy: {
            enable: isBiconomyEnabled,
            apiKey: fromChain?.gasless.apiKey ?? '',
            debug: false,
          },
          signatureType: SIGNATURE_TYPES.EIP712,
          walletProvider: rawEthereumProvider,
        });
      } else {
        hyphenObj = new Hyphen(rawEthereumProvider, {
          debug: true,
          infiniteApproval: true,
          environment: {
            [ENV.production]: 'prod',
            [ENV.test]: 'test',
            [ENV.staging]: 'staging',
            local: '',
          }[process.env.REACT_APP_ENV] as Environment,
          signatureType: SIGNATURE_TYPES.EIP712,
        });
      }

      await hyphenObj.init();
      setHyphen(hyphenObj);
    }

    initHyphen(isBiconomyEnabled);
  }, [
    fromChain?.gasless.apiKey,
    fromChainRpcUrlProvider,
    isBiconomyEnabled,
    rawEthereumProvider,
    walletProvider,
  ]);

  // recreate the async pool info getter everytime pool conditions change
  const getPoolInfo: () => Promise<PoolInfo> = useCallback(() => {
    if (
      !fromChain ||
      !toChain ||
      !hyphen ||
      !areChainsReady ||
      !selectedToken ||
      !selectedToken[fromChain.chainId] ||
      !selectedToken[toChain.chainId]
    ) {
      throw new Error('Prerequisites not met');
    }

    return hyphen.liquidityPool.getPoolInformation(
      selectedToken[fromChain.chainId].address,
      fromChain.chainId,
      toChain.chainId,
    );
  }, [fromChain, toChain, selectedToken, hyphen, areChainsReady]);

  const {
    value: poolInfo,
    execute: refreshPoolInfo,
    status: getPoolInfoStatus,
    // TODO: error handling
    // error,
  } = useAsync(getPoolInfo);

  useEffect(() => {
    if (refreshPoolInfo) {
      refreshPoolInfo();
    }
  }, [refreshPoolInfo, getPoolInfo]);

  return (
    <HyphenContext.Provider
      value={{
        hyphen,
        getPoolInfoStatus,
        poolInfo,
      }}
      {...props}
    />
  );
};

const useHyphen = () => useContext(HyphenContext);
export { HyphenProvider, useHyphen };
