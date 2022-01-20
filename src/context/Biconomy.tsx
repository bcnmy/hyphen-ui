import { createContext, useContext, useEffect, useMemo, useState } from "react";

// @ts-ignore
import { Biconomy } from "@biconomy/mexa";
import { useWalletProvider } from "./WalletProvider";
import { useChains } from "./Chains";

interface IBiconomyContext {
  biconomy: undefined | any;
  isBiconomyReady: boolean;
  isBiconomyEnabled: boolean;
  isBiconomyToggledOn: boolean;
  setIsBiconomyToggledOn: (isOn: boolean) => void;
  isBiconomyAllowed: boolean;
}

const BiconomyContext = createContext<IBiconomyContext | null>(null);

const BiconomyProvider: React.FC = (props) => {
  const { rawEthereumProvider, walletProvider } = useWalletProvider()!;
  const { fromChainRpcUrlProvider, fromChain, areChainsReady } = useChains()!;

  const [isBiconomyReady, setIsBiconomyReady] = useState(false);

  const isBiconomyAllowed = useMemo(
    () =>
      !!(!!fromChain?.networkAgnosticTransfer && !!fromChain.biconomy.enable),
    [fromChain]
  );

  const [isBiconomyToggledOn, setIsBiconomyToggledOn] = useState(false);

  const isBiconomyEnabled = useMemo(
    () =>
      !!(
        !!fromChain?.networkAgnosticTransfer &&
        !!fromChain.biconomy.enable &&
        isBiconomyToggledOn
      ),
    [fromChain, isBiconomyToggledOn]
  );

  useEffect(() => {
    console.log({ isBiconomyEnabled });
  }, [isBiconomyEnabled]);

  // reinitialize biconomy everytime from chain is changed
  const biconomy = useMemo(() => {
    // if biconomy is disabled for from chain, then don't initialise
    // or if from chain is not selected yet, then don't initialise
    if (!fromChain || !fromChain.biconomy.enable || !areChainsReady) {
      return;
    }

    let newBiconomy: any;

    // console.log({ fromChain, fromChainRpcUrlProvider });
    // if network agnostic transfers are enabled for current from chain
    // TODO: Because of bug in Biconomy SDK, fallback provider is not picked up automatically
    // So we need to redeclare Biconomy without network agnostic features to make it work properlys
    if (fromChain.networkAgnosticTransfer && isBiconomyEnabled) {
      if (!fromChainRpcUrlProvider) return;

      newBiconomy = new Biconomy(fromChainRpcUrlProvider, {
        apiKey: fromChain.biconomy.apiKey,
        debug: true,
        walletProvider: rawEthereumProvider,
      });
      return newBiconomy;
    } // else setup without network agnostic features
    else {
      if (!rawEthereumProvider) return;

      newBiconomy = new Biconomy(rawEthereumProvider, {
        apiKey: fromChain.biconomy.apiKey,
        debug: true,
      });
    }

    return newBiconomy;
  }, [
    rawEthereumProvider,
    fromChainRpcUrlProvider,
    fromChain,
    areChainsReady,
    isBiconomyEnabled,
  ]);

  useEffect(() => {
    if (!biconomy) return;

    let onReadyListener = () => {
      // Initialize your dapp here like getting user accounts etc
      setIsBiconomyReady(true);
      console.log("BICONOMY READY");
    };

    let onErrorListener = (error: any, message: any) => {
      // Handle error while initializing mexa
      setIsBiconomyReady(false);
    };

    biconomy
      .onEvent(biconomy.READY, onReadyListener)
      .onEvent(biconomy.ERROR, onErrorListener);

    // TODO:
    // once the Biconomy SDK has been updated to include support for removing event listeners,
    // make sure to remove both these event listeners in the cleanup function to allow for GC of old instances.
    // so uncomment the below returned function
    // return () => {
    //   biconomy.removeEventListener(biconomy.READY, onReadyListener);
    //   biconomy.removeEventListener(biconomy.ERROR, onErrorListener);
    // };
  }, [biconomy]);

  return (
    <BiconomyContext.Provider
      value={{
        isBiconomyReady,
        isBiconomyEnabled,
        isBiconomyAllowed,
        biconomy,
        isBiconomyToggledOn,
        setIsBiconomyToggledOn,
      }}
      {...props}
    />
  );
};

const useBiconomy = () => useContext(BiconomyContext);
export { BiconomyProvider, useBiconomy };
