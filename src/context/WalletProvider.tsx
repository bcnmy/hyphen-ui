import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ethers } from 'ethers';
import SmartAccount from '@biconomy-sdk/smart-account';
import SocialLogin from '@biconomy-sdk/web3-auth';

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
}

export enum SignTypeMethod {
  PERSONAL_SIGN = 'PERSONAL_SIGN',
  EIP712_SIGN = 'EIP712_SIGN',
}

const WalletProviderContext = createContext<IWalletProviderContext | null>(
  null,
);

const WalletProviderProvider = props => {
  const [walletProvider, setWalletProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer>();
  const [rawEthereumProvider, setRawEthereumProvider] = useState<any>();

  const [accounts, setAccounts] = useState<string[] | null>(null);
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
      const sdk = new SocialLogin();
      await sdk.init(ethers.utils.hexValue(5));
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
            dappAPIKey: 'gUv-7Xh-M.aa270a76-a1aa-4e79-bab5-8d857161c561',
          },
        ],
      });
      console.log('wallet ', wallet);
      wallet = await wallet.init();
      console.info('smartAccount', wallet);
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
    const sdk = new SocialLogin();
    await sdk.init(ethers.utils.hexValue(5));
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
      }}
      {...props}
    />
  );
};

const useWalletProvider = () => useContext(WalletProviderContext);
export { WalletProviderProvider, useWalletProvider };
