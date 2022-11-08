import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import SmartAccount from '@biconomy-sdk/smart-account'
import SocialLogin from '@biconomy-sdk/web3-auth';


interface IWalletProviderContext {
  walletProvider: ethers.providers.Web3Provider | undefined;
  signer: ethers.Signer | undefined;
  web3Modal: Web3Modal | undefined;
  connect: Web3Modal['connect'];
  socialConnect: () => Promise<SocialLogin | null>;
  socialDisconnect: () => Promise<void>;
  disconnect: Web3Modal['clearCachedProvider'];
  socialLoginSDK?: SocialLogin | null;
  accounts: string[] | undefined;
  smartAccount: SmartAccount | null;
  smartAccountAddress: string | null;
  currentChainId: number | undefined;
  isLoggedIn: boolean;
  rawEthereumProvider: undefined | any;
}

export enum SignTypeMethod {
  PERSONAL_SIGN = "PERSONAL_SIGN",
  EIP712_SIGN = "EIP712_SIGN"
}

const WalletProviderContext = createContext<IWalletProviderContext | null>(
  null,
);

const WalletProviderProvider = props => {
  const [walletProvider, setWalletProvider] = useState<
    undefined | ethers.providers.Web3Provider
  >();

  const [signer, setSigner] = useState<ethers.Signer>();

  const [web3Modal, setWeb3Modal] = useState<undefined | Web3Modal>();

  const [rawEthereumProvider, setRawEthereumProvider] = useState<any>();

  const [accounts, setAccounts] = useState<string[]>();
  const [currentChainId, setCurrentChainId] = useState<number>();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null)
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null)
  const [socialLoginSDK, setSocialLoginSDK] = useState<SocialLogin | null>(null)
  const [loading, setLoading] = useState(false);
  const [web3Auth, setWeb3Auth] = useState<any>(null);


  useEffect(() => {
    const initWallet = async () => {
      setLoading(true);
      const sdk = new SocialLogin();
      console.log('sdk ', sdk);
      
      sdk.init(ethers.utils.hexValue(5));
      sdk.showConnectModal();
      setLoading(false);
    };
    if (!socialLoginSDK) initWallet();
  }, [socialLoginSDK]);


  useEffect(() => {
    if (
      socialLoginSDK &&
      socialLoginSDK.web3auth &&
      socialLoginSDK.web3auth.provider
    ) {
      setWeb3Auth(socialLoginSDK.web3auth);
      setWalletProvider(
        new ethers.providers.Web3Provider(socialLoginSDK.web3auth.provider!),
      );
      setRawEthereumProvider(socialLoginSDK.web3auth.provider);
    }
  }, [socialLoginSDK, web3Auth]);

  useEffect(() => {
    if (
      rawEthereumProvider &&
      walletProvider &&
      currentChainId &&
      accounts &&
      accounts[0] &&
      accounts[0].length > 0
    ) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [rawEthereumProvider, walletProvider, currentChainId, accounts]);

  useEffect(() => {
    if (!walletProvider) return;
    setSigner(walletProvider.getSigner());
  }, [walletProvider]);

  useEffect(() => {
    setWeb3Modal(
      new Web3Modal({
        // network: "mumbai", // optional
        cacheProvider: true, // optional
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider, // required
            options: {
              // TODO: Add mainnet rpc urls.
              rpc: {
                1: 'https://eth-mainnet.alchemyapi.io/v2/wO7WAmNPAsZFhRlpd-xYjM-5Pl5Dx8-G',
                5: 'https://eth-goerli.alchemyapi.io/v2/mtR7c3X54OxnXVf_npwUrdNC57aIghCp',
                137: 'https://polygon-mainnet.g.alchemy.com/v2/SsLbrjcZfm-DHu3sWWw08_LjlIiRDdcH',
                43113: 'https://api.avax-test.network/ext/bc/C/rpc',
                43114: 'https://api.avax.network/ext/bc/C/rpc',
                80001:
                  'https://polygon-mumbai.g.alchemy.com/v2/a6rWdKyJis3Y8cWN6oDCWIxu8lrFX4J8',
              },
            },
          },
        },
      }),
    );
  }, []);

  // because provider does not fire events initially, we need to fetch initial values for current chain from walletProvider
  // subsequent changes to these values however do fire events, and we can just use those event handlers
  useEffect(() => {
    if (!walletProvider) return;
    (async () => {
      let { chainId } = await walletProvider.getNetwork();
      let accounts = await walletProvider.listAccounts();
      let wallet = new SmartAccount(walletProvider, {
        signType: SignTypeMethod.PERSONAL_SIGN,
        activeNetworkId: chainId,
        supportedNetworksIds: [chainId],
        bundlerUrl: 'http://localhost:3002'
      })
      console.log('wallet ', wallet);
      wallet = await wallet.init();
      console.info("smartAccount", wallet)
      setSmartAccount(wallet)
      setAccounts(accounts.map(a => a.toLowerCase()));
      setCurrentChainId(chainId);
    })();
  }, []);


  useEffect(() => {
    if (!smartAccount || !walletProvider || !accounts)
    return;
    (async () => {
    let { chainId } = await walletProvider.getNetwork();
     // get all smart account versions available and update in state
     const { data } = await smartAccount.getSmartAccountsByOwner({
      chainId: chainId,
      owner: accounts[0],
    });
    console.info("getSmartAccountsByOwner", data);
    setSmartAccountAddress(data[0]?.smartAccountAddress || '')
  })();
  }, [smartAccount, walletProvider]);

  const reinit = (changedProvider: any) => {
    setWalletProvider(new ethers.providers.Web3Provider(changedProvider));
  };

  // setup event handlers for web3 provider given by web3-modal
  // this is the provider injected by metamask/fortis/etc
  useEffect(() => {
    if (!rawEthereumProvider) return;

    function handleAccountsChanged(accounts: string[]) {
      console.log('accountsChanged!');
      setAccounts(accounts.map(a => a.toLowerCase()));
      reinit(rawEthereumProvider);
    }

    // Wallet documentation recommends reloading page on chain change.
    // Ref: https://docs.metamask.io/guide/ethereum-provider.html#events
    function handleChainChanged(chainId: string | number) {
      console.log('chainChanged!');
      if (typeof chainId === 'string') {
        setCurrentChainId(Number.parseInt(chainId));
      } else {
        setCurrentChainId(chainId);
      }
      reinit(rawEthereumProvider);
    }

    function handleConnect(info: { chainId: number }) {
      console.log('connect!');
      const { chainId } = info;
      if (typeof chainId === 'string') {
        setCurrentChainId(Number.parseInt(chainId));
      } else {
        setCurrentChainId(chainId);
      }
      reinit(rawEthereumProvider);
    }

    function handleDisconnect(error: { code: number; message: string }) {
      console.log('disconnect');
      console.error(error);
    }

    // Subscribe to accounts change
    rawEthereumProvider.on('accountsChanged', handleAccountsChanged);

    // Subscribe to network change
    rawEthereumProvider.on('chainChanged', handleChainChanged);

    // Subscribe to provider connection
    rawEthereumProvider.on('connect', handleConnect);

    // Subscribe to provider disconnection
    rawEthereumProvider.on('disconnect', handleDisconnect);

    // Remove event listeners on unmount!
    return () => {
      rawEthereumProvider.removeListener(
        'accountsChanged',
        handleAccountsChanged,
      );
      rawEthereumProvider.removeListener('chainChanged', handleChainChanged);
      rawEthereumProvider.removeListener('connect', handleConnect);
      rawEthereumProvider.removeListener('disconnect', handleDisconnect);
    };
  }, [rawEthereumProvider]);

  const connect = useCallback(async () => {
    if (!web3Modal) {
      console.error('Web3Modal not initialized.');
      return;
    }
    let provider = await web3Modal.connect();
    setRawEthereumProvider(provider);
    setWalletProvider(new ethers.providers.Web3Provider(provider));
  }, [web3Modal]);

  const socialConnect = useCallback(async () => {
    if (socialLoginSDK) {
      socialLoginSDK.showWallet();
      return socialLoginSDK;
    }
    setLoading(true);
    const sdk = new SocialLogin();
    await sdk.init(ethers.utils.hexValue(5));
    sdk.showConnectModal();
    sdk.showWallet();
    setSocialLoginSDK(sdk);
    setLoading(false);
    return socialLoginSDK;
  }, [socialLoginSDK]);

  const disconnect = useCallback(async () => {
    if (!web3Modal) {
      console.error('Web3Modal not initialized.');
      return;
    }
    web3Modal.clearCachedProvider();
    setRawEthereumProvider(undefined);
    setWalletProvider(undefined);
  }, [web3Modal]);

  const socialDisconnect = useCallback(async () => {
    if (!socialLoginSDK || !socialLoginSDK.web3auth) {
      console.error('Web3Modal not initialized.');
      return;
    }
    socialLoginSDK.web3auth.logout();
    setRawEthereumProvider(null);
    setWalletProvider(undefined);
  }, [socialLoginSDK]);

  return (
    <WalletProviderContext.Provider
      value={{
        rawEthereumProvider,
        walletProvider,
        signer,
        web3Modal,
        socialConnect,
        socialDisconnect,
        connect,
        disconnect,
        smartAccount,
        smartAccountAddress,
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
