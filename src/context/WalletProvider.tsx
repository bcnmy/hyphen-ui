import { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

interface IWalletProviderContext {
  walletProvider: ethers.providers.Web3Provider | undefined;
  signer: ethers.Signer | undefined;
  connect: (() => void) | undefined;
  disconnect: Web3Modal['clearCachedProvider'];
  accounts: string[] | undefined;
  currentChainId: number | undefined;
  isLoggedIn: boolean;
  rawEthereumProvider: undefined | any;
}

const WalletProviderContext = createContext<IWalletProviderContext | null>(
  null,
);

const WalletProviderProvider: React.FC = props => {
  const { connector, isConnected: isLoggedIn, address } = useAccount();
  const [walletProvider, setWalletProvider] = useState<
    undefined | ethers.providers.Web3Provider
  >();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  const [signer, setSigner] = useState<ethers.Signer>();

  const [rawEthereumProvider, setRawEthereumProvider] = useState<any>();

  const [currentChainId, setCurrentChainId] = useState<number>();

  useEffect(() => {
    if (!connector) return;
    (async () => {
      setCurrentChainId(await connector.getChainId());
      const provider = await connector.getProvider();
      setRawEthereumProvider(provider);
      const walletClientProvider = new ethers.providers.Web3Provider(provider);
      setWalletProvider(walletClientProvider);
      setSigner(walletClientProvider.getSigner());
    })();
  }, [connector]);

  useEffect(() => {
    if (!walletProvider) return;
    setSigner(walletProvider.getSigner());
  }, [walletProvider]);

  return (
    <WalletProviderContext.Provider
      value={{
        rawEthereumProvider,
        walletProvider,
        signer,
        connect: openConnectModal!,
        disconnect,
        accounts: [address!],
        currentChainId,
        isLoggedIn,
      }}
      {...props}
    />
  );
};

const useWalletProvider = () => useContext(WalletProviderContext);
export { WalletProviderProvider, useWalletProvider };
