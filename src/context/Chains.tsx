import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// @ts-ignore
import { ethers } from 'ethers';
import { useWalletProvider } from './WalletProvider';
import useNetworks, { Network } from 'hooks/useNetworks';

interface IChainsContext {
  areChainsReady: boolean;
  fromChainRpcUrlProvider: undefined | ethers.providers.JsonRpcProvider;
  toChainRpcUrlProvider: undefined | ethers.providers.JsonRpcProvider;
  fromChain: undefined | Network;
  toChain: undefined | Network;
  changeFromChain: (chain: Network) => void;
  changeToChain: (chain: Network) => void;
  switchChains: () => void;
  networks: Network[] | undefined;
  isNetworksLoading: boolean;
  isNetworksError: boolean;
  selectedNetwork: Network | undefined;
  changeSelectedNetwork: (network: Network) => void;
}

const ChainsContext = createContext<IChainsContext | null>(null);

const ChainsProvider: React.FC = props => {
  const { currentChainId } = useWalletProvider()!;
  const {
    data: networks,
    isLoading: isNetworksLoading,
    isError: isNetworksError,
  } = useNetworks();

  const [fromChain, setFromChain] = useState<Network>();
  const [toChain, setToChain] = useState<Network>();

  const [selectedNetwork, setSelectedNetwork] = useState<Network>();

  const [areChainsReady, setAreChainsReady] = useState(false);

  const fromChainRpcUrlProvider = useMemo(() => {
    if (!fromChain || !fromChain.rpc) return undefined;
    return new ethers.providers.JsonRpcProvider(fromChain.rpc);
  }, [fromChain]);

  const toChainRpcUrlProvider = useMemo(() => {
    if (!toChain || !toChain.rpc) return undefined;
    return new ethers.providers.JsonRpcProvider(toChain.rpc);
  }, [toChain]);

  // default from chain to current metamak chain on startup
  // else if default chain is not supported, then use the first supported chain
  useEffect(() => {
    setToChain(undefined);
    if (!currentChainId) {
      setFromChain(networks?.[0]);
      return;
    }
    let currentMetamaskChain = networks?.find(
      network => network.chainId === currentChainId,
    );

    if (currentMetamaskChain) {
      setFromChain(currentMetamaskChain);
    } else {
      setFromChain(networks?.[0]);
    }
  }, [currentChainId, networks]);

  useEffect(() => {
    const network = networks?.find(
      chainObj => chainObj.chainId === currentChainId,
    );

    if (network) {
      setSelectedNetwork(network);
    }
  }, [currentChainId, networks]);

  useEffect(() => {
    (async () => {
      if (
        fromChain &&
        fromChainRpcUrlProvider &&
        fromChain.chainId ===
          (await fromChainRpcUrlProvider.getNetwork()).chainId &&
        toChain &&
        toChainRpcUrlProvider &&
        toChain.chainId === (await toChainRpcUrlProvider.getNetwork()).chainId
      ) {
        setAreChainsReady(true);
      } else {
        setAreChainsReady(false);
      }
    })();
  });

  const changeFromChain = useCallback((chain: Network) => {
    setToChain(undefined);
    setFromChain(chain);
  }, []);

  const changeToChain = useCallback(
    (chain: Network) => {
      if (fromChain) {
        setToChain(chain);
      }
    },
    [fromChain],
  );

  const switchChains = useCallback(() => {
    if (fromChain && toChain) {
      setFromChain(toChain);
      setToChain(fromChain);
    }
  }, [toChain, fromChain]);

  const changeSelectedNetwork = useCallback((network: Network) => {
    setSelectedNetwork(network);
  }, []);

  return (
    <ChainsContext.Provider
      value={{
        areChainsReady,
        switchChains,
        changeFromChain,
        changeToChain,
        fromChainRpcUrlProvider,
        toChainRpcUrlProvider,
        fromChain,
        toChain,
        networks,
        isNetworksLoading,
        isNetworksError,
        selectedNetwork,
        changeSelectedNetwork,
      }}
      {...props}
    />
  );
};

const useChains = () => useContext(ChainsContext);
export { ChainsProvider, useChains };
