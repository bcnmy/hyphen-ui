import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ethers } from 'ethers';
import SmartAccount from '@biconomy/smart-account';
import SocialLogin, { getSocialLoginSDK } from '@biconomy/web3-auth';
import { toast } from 'react-toastify';
interface IWalletProviderContext {
  walletProvider: ethers.providers.Web3Provider | undefined;
  signer: ethers.Signer | undefined;
  connect: () => Promise<SocialLogin | null | undefined>;
  disconnect: () => Promise<void>;
  socialLoginSDK?: SocialLogin | null;
  accounts: string[] | null;
  smartAccount: SmartAccount | null;
  smartAccountAddress: string | null;
  currentChainId: number | undefined;
  isLoggedIn: boolean;
  loading: boolean;
  rawEthereumProvider: undefined | any;
  userInfo: any;
}

export enum SignTypeMethod {
  PERSONAL_SIGN = 'PERSONAL_SIGN',
  EIP712_SIGN = 'EIP712_SIGN',
}

const WalletProviderContext = createContext<IWalletProviderContext | null>(
  null,
);

const Web3AuthChainId = 137;

const WalletProviderProvider = props => {
  const [walletProvider, setWalletProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer>();
  const [rawEthereumProvider, setRawEthereumProvider] = useState<any>();

  const [accounts, setAccounts] = useState<string[] | null>(null);
  const [userInfo, setUserInfo] = useState(null);
  const [currentChainId, setCurrentChainId] = useState<number>();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(
    null,
  );
  const [socialLoginSDK, setSocialLoginSDK] = useState<SocialLogin | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  // const [web3Auth, setWeb3Auth] = useState<any>(null);

  // create socialLoginSDK and call the init
  useEffect(() => {
    const initWallet = async () => {
      const sdk = await getSocialLoginSDK(
        ethers.utils.hexValue(Web3AuthChainId),
        {
          'https://sdk-demo.biconomy.io':
            'MEUCIQDLg0nfQqUyMqInsUmnRNv1GOtcbeoqafYDb2ShWaZo5AIgRKOLfw87rX3a2uVZpMAkoGwjrLgNwlfdvk33XGHcOMs',
        },
      );
      sdk.showConnectModal();
      setSocialLoginSDK(sdk);
    };
    if (!socialLoginSDK) initWallet();
  }, [socialLoginSDK]);

  // after social login -> set provider info
  useEffect(() => {
    if (socialLoginSDK?.provider && !accounts?.length) {
      setLoading(true);
      const newProvider = new ethers.providers.Web3Provider(
        socialLoginSDK.provider,
      );
      newProvider.listAccounts().then(accounts => {
        setAccounts(accounts.map(a => a.toLowerCase()));
      });
      setRawEthereumProvider(socialLoginSDK.provider);
      setWalletProvider(newProvider);
      setSigner(newProvider.getSigner());
      socialLoginSDK.getUserInfo().then((user: any) => {
        console.log('user', user);
        setUserInfo(user);
      });
    }
  }, [accounts?.length, socialLoginSDK, socialLoginSDK?.provider]);

  // after metamask login -> get provider event
  useEffect(() => {
    const interval = setInterval(async () => {
      if (accounts?.length) {
        clearInterval(interval);
      }
      if (socialLoginSDK?.provider && !accounts?.length) {
        setLoading(true);
        const newProvider = new ethers.providers.Web3Provider(
          socialLoginSDK.provider,
        );
        newProvider.listAccounts().then(accounts => {
          setAccounts(accounts.map(a => a.toLowerCase()));
        });
        setRawEthereumProvider(socialLoginSDK.provider);
        setWalletProvider(newProvider);
        setSigner(newProvider.getSigner());
        await socialLoginSDK.getUserInfo().then((user: any) => {
          console.log('user', user);
          setUserInfo(user);
        });
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [accounts?.length, socialLoginSDK]);

  // if everything initiated setIsLoggedIn true
  useEffect(() => {
    if (
      rawEthereumProvider &&
      walletProvider &&
      currentChainId &&
      accounts &&
      accounts[0] &&
      accounts[0].length > 0
    ) {
      console.log('LoggedIn Initiated');
      setIsLoggedIn(true);
      setLoading(false);
    } else {
      setIsLoggedIn(false);
      console.log('LoggedIn Completed');
    }
  }, [rawEthereumProvider, walletProvider, currentChainId, accounts]);

  useEffect(() => {
    console.log('hidelwallet');
    if (socialLoginSDK && accounts?.length) {
      socialLoginSDK.hideWallet();
    }
  }, [accounts, socialLoginSDK]);

  // because provider does not fire events initially, we need to fetch initial values for current chain from walletProvider
  // subsequent changes to these values however do fire events, and we can just use those event handlers
  useEffect(() => {
    if (!walletProvider) return;
    (async () => {
      let { chainId } = await walletProvider.getNetwork();
      let wallet = new SmartAccount(walletProvider, {
        signType: SignTypeMethod.PERSONAL_SIGN,
        activeNetworkId: chainId,
        supportedNetworksIds: [chainId],
        networkConfig: [
          {
            chainId: chainId,
            dappAPIKey: '59fRCMXvk.8a1652f0-b522-4ea7-b296-98628499aee3',
          },
        ],
      });
      console.log('wallet ', wallet);
      wallet = await wallet.init();
      console.info('smartAccount', wallet);

      wallet.on('txHashChanged', (response: any) => {
        console.log(
          'txHashChanged event received in addLiq via emitter',
          response,
        );
        toast.info(`Transaction updated with hash: ${response.hash}`);
        toast.success(`Transaction confirmed. Click to open the explorer.`, {
          onClick: () => {
            window.open(
              `https://mumbai.polygonscan.com/tx/${response.hash}`,
              '_blank',
            );
          },
          position: toast.POSITION.TOP_RIGHT,
          className: 'font-sans font-medium',
        });
      });

      wallet.on('txMined', (response: any) => {
        console.log('txMined event received in addLiq via emitter', response);
        toast.success(`Transaction confirmed. Click to open the explorer.`, {
          onClick: () => {
            window.open(
              `https://mumbai.polygonscan.com/tx/${response.hash}`,
              '_blank',
            );
          },
          position: toast.POSITION.TOP_RIGHT,
          className: 'font-sans font-medium',
        });
      });

      wallet.on('error', (response: any) => {
        console.log('error event received in addLiq via emitter', response);
        toast.info(`Transaction error: ${response.hash}`);
      });
      setSmartAccount(wallet);
      setCurrentChainId(chainId);
    })();
  }, [walletProvider]);

  useEffect(() => {
    if (!smartAccount || !walletProvider || !accounts) return;
    (async () => {
      let { chainId } = await walletProvider.getNetwork();
      // get all smart account versions available and update in state
      const { data } = await smartAccount.getSmartAccountsByOwner({
        chainId: chainId,
        owner: accounts[0],
      });
      console.info('getSmartAccountsByOwner', data);
      setSmartAccountAddress(data[0]?.smartAccountAddress || '');
    })();
  }, [accounts, smartAccount, walletProvider]);

  const connect = useCallback(async () => {
    if (accounts) return;
    if (socialLoginSDK?.web3auth?.provider) {
      setLoading(true);
      const newProvider = new ethers.providers.Web3Provider(
        socialLoginSDK.web3auth.provider,
      );
      setWalletProvider(newProvider);
      setSigner(newProvider.getSigner());
      await socialLoginSDK.getUserInfo().then((user: any) => {
        console.log('user', user);
        setUserInfo(user);
      });
      setRawEthereumProvider(socialLoginSDK.web3auth.provider);
      await newProvider.listAccounts().then(accounts => {
        setAccounts(accounts.map(a => a.toLowerCase()));
      });
      return;
    }
    if (socialLoginSDK?.provider) {
      setLoading(true);
      const newProvider = new ethers.providers.Web3Provider(
        socialLoginSDK.provider,
      );
      setWalletProvider(newProvider);
      setSigner(newProvider.getSigner());
      await socialLoginSDK.getUserInfo().then((user: any) => {
        console.log('user', user);
        setUserInfo(user);
      });
      setRawEthereumProvider(socialLoginSDK.provider);
      await newProvider.listAccounts().then(accounts => {
        setAccounts(accounts.map(a => a.toLowerCase()));
      });
      return;
    }
    if (socialLoginSDK) {
      socialLoginSDK.showWallet();
      return socialLoginSDK;
    }
    setLoading(true);
    const sdk = await getSocialLoginSDK(
      ethers.utils.hexValue(Web3AuthChainId),
      {
        'https://sdk-demo.biconomy.io':
          'MEUCIQDLg0nfQqUyMqInsUmnRNv1GOtcbeoqafYDb2ShWaZo5AIgRKOLfw87rX3a2uVZpMAkoGwjrLgNwlfdvk33XGHcOMs',
      },
    );
    sdk.showConnectModal();
    sdk.showConnectModal();
    sdk.showWallet();
    setSocialLoginSDK(sdk);
    setLoading(false);
    return socialLoginSDK;
  }, [accounts, socialLoginSDK]);

  const disconnect = useCallback(async () => {
    if (!socialLoginSDK || !socialLoginSDK.web3auth) {
      console.error('socialLoginSDK not initialized.');
      return;
    }
    await socialLoginSDK.logout();
    setRawEthereumProvider(null);
    setWalletProvider(null);
    setAccounts(null);
    socialLoginSDK.hideWallet();
  }, [socialLoginSDK]);

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

  return (
    <WalletProviderContext.Provider
      value={{
        rawEthereumProvider,
        walletProvider,
        signer,
        connect,
        disconnect,
        smartAccount,
        smartAccountAddress,
        accounts,
        currentChainId,
        isLoggedIn,
        loading,
        userInfo,
      }}
      {...props}
    />
  );
};

const useWalletProvider = () => useContext(WalletProviderContext);
export { WalletProviderProvider, useWalletProvider };
