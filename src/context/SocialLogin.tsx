import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ethers } from 'ethers';
import SocialLogin from '@biconomy-sdk/web3-auth';
import SmartAccount from '@biconomy-sdk/smart-account'

interface ISocialLoginProviderContext {
  walletProvider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  connect: () => Promise<SocialLogin | null>;
  disconnect: () => Promise<void>;
  socialLoginSDK: SocialLogin | null;
  accounts: string[] | null;
  smartAccount: SmartAccount | null;
  smartAccountAddress: string | null;
  currentChainId: number | null;
  isLoggedIn: boolean;
  rawEthereumProvider: null | any;
}

export enum SignTypeMethod {
  PERSONAL_SIGN = "PERSONAL_SIGN",
  EIP712_SIGN = "EIP712_SIGN"
}

const SocialLoginProviderContext =
  createContext<ISocialLoginProviderContext | null>(null);

const SocialLoginProviderProvider = props => {
  const [walletProvider, setWalletProvider] =
    useState<ethers.providers.Web3Provider | null>(null);

  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [web3Auth, setWeb3Auth] = useState<any>(null);
  const [rawEthereumProvider, setRawEthereumProvider] = useState<any>();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [currentChainId, setCurrentChainId] = useState<number>(1);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null)
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null)

  const [socialLoginSDK, setSocialLoginSDK] = useState<SocialLogin | null>(
    null,
  );

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
  }, [walletProvider]);

  useEffect(() => {
    if (!smartAccount || !walletProvider || accounts.length == 0)
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

  const connect = useCallback(async () => {
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
    if (!socialLoginSDK || !socialLoginSDK.web3auth) {
      console.error('Web3Modal not initialized.');
      return;
    }
    socialLoginSDK.web3auth.logout();
    setRawEthereumProvider(null);
    setWalletProvider(null);
  }, [socialLoginSDK]);

  return (
    <SocialLoginProviderContext.Provider
      value={{
        rawEthereumProvider,
        walletProvider,
        signer,
        connect,
        socialLoginSDK,
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

const useSocialLoginProvider = () => useContext(SocialLoginProviderContext);
export { SocialLoginProviderProvider, useSocialLoginProvider };