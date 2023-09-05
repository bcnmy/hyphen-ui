import "@rainbow-me/rainbowkit/styles.css";
import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";

interface IWalletProviderContext {
    walletProvider: ethers.providers.Web3Provider | undefined;
}

const WalletProviderContext = createContext<IWalletProviderContext | null>(
    null
);

const WalletProviderProvider: React.FC = (props) => {
    const { connector } = useAccount();
    const [walletProvider, setWalletProvider] = useState<any>();

    useEffect(() => {
        const init = async () => {
            const provider = await connector?.getProvider();
            setWalletProvider(new ethers.providers.Web3Provider(provider));
        };

        init();
    }, [connector]);

    return (
        <WalletProviderContext.Provider
            value={{
                walletProvider,
            }}
            {...props}
        />
    );
};

const useWalletProvider = () => useContext(WalletProviderContext);
export { WalletProviderProvider, useWalletProvider };

