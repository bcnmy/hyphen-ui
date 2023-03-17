import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ethers, Signer } from "ethers";
import { useWeb3Modal } from "@web3modal/react";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { goerli, mainnet, polygon, polygonMumbai } from "wagmi/chains";
import { Hyphen, SIGNATURE_TYPES } from "@biconomy/hyphen";
import {
  useAccount,
  useDisconnect,
  useNetwork,
  useProvider,
  useSigner,
} from "wagmi";
import { ENV } from "types/environment";
import { useChains } from "./Chains";
import { chains, pubProv } from "config/wagmi";

interface IWalletProviderContext {
  walletProvider: ethers.providers.Web3Provider | undefined;
  signer: ethers.Signer | undefined;
  // web3Modal: Web3Modal | undefined;
  connect: Web3Modal["connect"];
  disconnect: Web3Modal["clearCachedProvider"];
  accounts: string[] | undefined;
  currentChainId: number | undefined;
  isLoggedIn: boolean;
  rawEthereumProvider: undefined | any;
}

const WalletProviderContext = createContext<IWalletProviderContext | null>(
  null
);

const WalletProviderProvider: React.FC = (props) => {
  const [walletProvider, setWalletProvider] = useState<
    undefined | ethers.providers.Web3Provider
  >();

  const { data } = useSigner();

  const signer = data as Signer;

  // const [web3Modal, setWeb3Modal] = useState<undefined | Web3Modal>();
  const { open, setDefaultChain, isOpen } = useWeb3Modal();
  const { disconnect } = useDisconnect();

  // const [rawEthereumProvider, setRawEthereumProvider] = useState<any>();
  const rawEthereumProvider = useProvider();

  console.log("🚀 ~ file: WalletProvider.tsx:61 ~ pubProv:", pubProv(polygonMumbai).provider());
  const hyphen: any = new Hyphen(pubProv(polygonMumbai).provider(), {
    infiniteApproval: true,
    environment: {
      [ENV.production]: "prod",
      [ENV.test]: "test",
      [ENV.staging]: "staging",
      local: "",
    }[process.env.REACT_APP_ENV],
    biconomy: {
      enable: true,
      apiKey: "r8N3i0Ukw.bb5dd97d-af25-47cb-9281-2069f1b95ade",
    },
    signatureType: SIGNATURE_TYPES.EIP712,
    walletProvider: rawEthereumProvider,
  });
  console.log("🚀 ~ file: WalletProvider.tsx:76 ~ hyphen:", hyphen);

  // const [accounts, setAccounts] = useState<string[]>();
  const { address, isConnected: isLoggedIn } = useAccount({
    onConnect() {
      console.log("Connected");
    },
    onDisconnect() {
      console.log("Disconnected");
    },
  });

  const accounts = address ? [address] : undefined;
  const { chain } = useNetwork();
  const currentChainId = chain?.id;

  // const [currentChainId, setCurrentChainId] = useState<number>();
  // const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // useEffect(() => {
  //   if (rawEthereumProvider && walletProvider && currentChainId && address) {
  // setIsLoggedIn(true);
  //   } else {
  // setIsLoggedIn(false);
  //   }
  // }, [rawEthereumProvider, walletProvider, currentChainId, address]);

  // useEffect(() => {
  //   if (!walletProvider) return;
  //   setSigner(walletProvider.getSigner());
  // }, [walletProvider]);

  // useEffect(() => {
  // setWeb3Modal(
  //   new Web3Modal({
  //     // network: "mumbai", // optional
  //     cacheProvider: true, // optional
  //     providerOptions: {
  //       walletconnect: {
  //         package: WalletConnectProvider, // required
  //         options: {
  //           infuraId: process.env.REACT_APP_INFURA_ID, // required
  //         },
  //       },
  //     },
  //   })
  // );
  // }, []);

  // because provider does not fire events initially, we need to fetch initial values for current chain from walletProvider
  // subsequent changes to these values however do fire events, and we can just use those event handlers
  // useEffect(() => {
  //   if (!walletProvider) return;
  //   (async () => {
  // let { chainId } = await walletProvider.getNetwork();
  // let accounts = await walletProvider.listAccounts();
  // setAccounts(accounts.map((a) => a.toLowerCase()));
  // setCurrentChainId(chainId);
  //   })();
  // }, [walletProvider]);

  // const reinit = (changedProvider: any) => {
  //   setWalletProvider(new ethers.providers.Web3Provider(changedProvider));
  // };

  // setup event handlers for web3 provider given by web3-modal
  // this is the provider injected by metamask/fortis/etc
  useEffect(() => {
    if (!rawEthereumProvider) return;

    function handleAccountsChanged(accounts: string[]) {
      console.log("accountsChanged!");
      // setAccounts(accounts.map((a) => a.toLowerCase()));
      // reinit(rawEthereumProvider);
    }

    // Wallet documentation recommends reloading page on chain change.
    // Ref: https://docs.metamask.io/guide/ethereum-provider.html#events
    function handleChainChanged(chainId: string | number) {
      console.log("chainChanged!");
      // if (typeof chainId === "string") {
      //   setCurrentChainId(Number.parseInt(chainId));
      // } else {
      //   setCurrentChainId(chainId);
      // }
      // reinit(rawEthereumProvider);
    }

    // function handleConnect(info: { chainId: number }) {
    //   console.log("connect!");
    //   // setCurrentChainId(info.chainId);
    //   reinit(rawEthereumProvider);
    // }

    // function handleDisconnect(error: { code: number; message: string }) {
    //   console.log("disconnect");
    //   console.error(error);
    // }

    // Subscribe to accounts change
    rawEthereumProvider.on("accountsChanged", handleAccountsChanged);

    // Subscribe to network change
    rawEthereumProvider.on("chainChanged", handleChainChanged);

    // // Subscribe to provider connection
    // rawEthereumProvider.on("connect", handleConnect);

    // // Subscribe to provider disconnection
    // rawEthereumProvider.on("disconnect", handleDisconnect);

    // Remove event listeners on unmount!
    return () => {
      rawEthereumProvider.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
      rawEthereumProvider.removeListener("networkChanged", handleChainChanged);
    };
  }, [rawEthereumProvider]);

  const connect = async () => {
    // if (!web3Modal) {
    //   console.error("Web3Modal not initialized.");
    //   return;
    // }
    // let provider = await web3Modal.connect();
    // // setRawEthereumProvider(provider);
    // setWalletProvider(new ethers.providers.Web3Provider(provider));
    await open();
  };

  // const disconnect = async () => {
  //   if (isConnected) {
  //     disconnect();
  //   } else {
  //     await onOpen();
  //   }
  // };

  // console.log(
  //   rawEthereumProvider,
  //   walletProvider,
  //   signer,
  //   // web3Modal,
  //   connect,
  //   disconnect,
  //   accounts,
  //   currentChainId,
  //   isLoggedIn
  // );

  return (
    <WalletProviderContext.Provider
      value={{
        rawEthereumProvider,
        walletProvider,
        signer,
        // web3Modal,
        connect,
        disconnect,
        accounts,
        currentChainId,
        isLoggedIn,
      }}
      {...props}
    />
  );
};

const useWalletProvider = () => useContext(WalletProviderContext);
export { WalletProviderProvider, useWalletProvider };
