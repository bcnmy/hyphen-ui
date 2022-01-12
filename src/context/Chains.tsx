import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// @ts-ignore
import { ethers } from "ethers";
import { ChainConfig } from "../config/chains";
import { config } from "../config";
import { useWalletProvider } from "./WalletProvider";

interface IChainsContext {
  areChainsReady: boolean;
  fromChainRpcUrlProvider: undefined | ethers.providers.JsonRpcProvider;
  toChainRpcUrlProvider: undefined | ethers.providers.JsonRpcProvider;
  fromChain: undefined | ChainConfig;
  toChain: undefined | ChainConfig;
  compatibleToChainsForCurrentFromChain: undefined | ChainConfig[];
  changeToChain: (chain: ChainConfig) => void;
  setFromChain: (chain: ChainConfig) => void;
  switchChains: () => void;
  chainsList: ChainConfig[];
}

const chainsList = config.chains;

const ChainsContext = createContext<IChainsContext | null>(null);

const ChainsProvider: React.FC = (props) => {
  const { currentChainId } = useWalletProvider()!;

  const [fromChain, setFromChain] = useState<ChainConfig>();
  const [toChain, setToChain] = useState<ChainConfig>();

  const [areChainsReady, setAreChainsReady] = useState(false);

  const fromChainRpcUrlProvider = useMemo(() => {
    if (!fromChain) return undefined;
    return new ethers.providers.JsonRpcProvider(fromChain.rpcUrl);
  }, [fromChain]);

  const toChainRpcUrlProvider = useMemo(() => {
    if (!toChain) return undefined;
    return new ethers.providers.JsonRpcProvider(toChain.rpcUrl);
  }, [toChain]);

  // default from chain to current metamak chain on startup
  // else if default chain is not supported, then use the first supported chain
  useEffect(() => {
    if (!currentChainId) {
      setFromChain(chainsList[0]);
      return;
    }
    let currentMetamaskChain = chainsList.find(
      (chain) => chain.chainId === currentChainId
    );
    // console.log({ currentChainId, chainsList });
    if (currentMetamaskChain) {
      setFromChain(currentMetamaskChain);
      // console.log(currentMetamaskChain);
    } else {
      setFromChain(chainsList[0]);
    }
  }, [currentChainId]);

  // TODO: This should happen synchronously together with from Chain change, so it should not be its own effect,
  // but rather be a function that is called every time there is possibility of to Chain becoming invalid.
  // This needs to be synchronous to facilitate Hyphen not confusing status between renders.
  // What that means is, we should not have any instance between renders where toChain is invalid.

  // whenever from chain changes, if a to chain is not selected,
  // or if the selected to chain is not valid, then default to the first
  // suitable to chain
  useEffect(() => {
    if (!fromChain) return;
    if (
      !toChain ||
      config.chainMap[fromChain.chainId].indexOf(toChain.chainId) === -1
    ) {
      setToChain(
        chainsList.find(
          (chain) => chain.chainId === config.chainMap[fromChain.chainId][0]
        )
      );
    }
  }, [fromChain, toChain]);

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

  const compatibleToChainsForCurrentFromChain = useMemo(() => {
    if (!fromChain) return undefined;
    return config.chainMap[fromChain.chainId].map(
      (compatibleChainId) =>
        config.chains.find(
          (chain) => chain.chainId === compatibleChainId
        ) as ChainConfig
    );
  }, [fromChain]);

  const changeToChain = useCallback(
    (chain: ChainConfig) => {
      if (
        fromChain &&
        config.chainMap[fromChain.chainId].indexOf(chain.chainId) !== -1
      ) {
        setToChain(chain);
      } else {
        throw new Error("To Chain not supported for current from chain");
      }
    },
    [fromChain]
  );

  const switchChains = useCallback(() => {
    setToChain(fromChain);
    setFromChain(toChain);
  }, [toChain, fromChain]);

  return (
    <ChainsContext.Provider
      value={{
        areChainsReady,
        switchChains,
        changeToChain,
        setFromChain,
        fromChainRpcUrlProvider,
        toChainRpcUrlProvider,
        compatibleToChainsForCurrentFromChain,
        fromChain,
        toChain,
        chainsList,
      }}
      {...props}
    />
  );
};

const useChains = () => useContext(ChainsContext);
export { ChainsProvider, useChains };
