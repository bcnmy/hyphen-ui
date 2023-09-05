import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

// @ts-ignore
import { Hyphen, SIGNATURE_TYPES } from "@biconomy/hyphen";

import { useChains } from "./Chains";
import { useToken } from "./Token";
import useAsync, { Status } from "hooks/useLoading";
import { useBiconomy } from "./Biconomy";
import { ENV } from "types/environment";
import { useAccount } from "wagmi";
import { useWalletProvider } from "./WalletProvider";

type PoolInfo = {
    minDepositAmount: number;
    maxDepositAmount: number;
    fromLPManagerAddress: string;
    toLPManagerAddress: string;
};

interface IHyphenContext {
    hyphen: any;
    poolInfo: PoolInfo | undefined;
    getPoolInfoStatus: Status;
}

const HyphenContext = createContext<IHyphenContext | null>(null);

const HyphenProvider: React.FC = (props) => {
    const { selectedToken } = useToken()!;
    const { isBiconomyEnabled } = useBiconomy()!;
    const { walletProvider } = useWalletProvider()!;

    const { fromChainRpcUrlProvider, fromChain, toChain, areChainsReady } =
        useChains()!;
    // reinitialize hyphen everytime conditions change
    // TODO: Because of bug in Biconomy SDK, fallback provider is not picked up automatically
    // So we need to redeclare Hyphen with biconomy disabled if we want hypen to work properly
    const hyphen = useMemo(() => {
        if (!walletProvider || !fromChainRpcUrlProvider) return;
        let hyphen;

        if (isBiconomyEnabled) {
            hyphen = new Hyphen(fromChainRpcUrlProvider, {
                debug: true,
                infiniteApproval: true,
                environment: {
                    [ENV.production]: "prod",
                    [ENV.test]: "test",
                    [ENV.staging]: "staging",
                    local: "",
                }[process.env.REACT_APP_ENV],
                biconomy: {
                    enable: isBiconomyEnabled,
                    apiKey: fromChain?.biconomy.apiKey,
                },
                signatureType: SIGNATURE_TYPES.EIP712,
                walletProvider: walletProvider,
            });
        } else {
            hyphen = new Hyphen(walletProvider, {
                debug: true,
                infiniteApproval: true,
                environment: {
                    [ENV.production]: "prod",
                    [ENV.test]: "test",
                    [ENV.staging]: "staging",
                    local: "",
                }[process.env.REACT_APP_ENV],
                signatureType: SIGNATURE_TYPES.EIP712,
            });
        }
        console.log({ hyphen });
        return hyphen;
    }, [
        isBiconomyEnabled,
        fromChainRpcUrlProvider,
        fromChain?.biconomy.apiKey,
        walletProvider,
    ]);

    // // recreate the async pool info getter everytime pool conditions change
    const getPoolInfo: () => Promise<PoolInfo> = useCallback(() => {
        if (
            !fromChain ||
            !toChain ||
            !areChainsReady ||
            !selectedToken ||
            !selectedToken[fromChain.chainId] ||
            !selectedToken[toChain.chainId]
        ) {
            throw new Error("Prerequisites not met");
        }
        return hyphen!.getPoolInformation(
            selectedToken[fromChain.chainId].address,
            fromChain.chainId,
            toChain.chainId
        );
    }, [fromChain, toChain, selectedToken, hyphen, areChainsReady]);

    const {
        value: poolInfo,
        execute: refreshPoolInfo,
        status: getPoolInfoStatus,
        // TODO: error handling
        // error,
    } = useAsync(getPoolInfo);

    useEffect(() => {
        if (refreshPoolInfo) {
            refreshPoolInfo();
        }
    }, [refreshPoolInfo, getPoolInfo]);

    return (
        <HyphenContext.Provider
            value={{
                hyphen,
                getPoolInfoStatus,
                poolInfo,
            }}
            {...props}
        />
    );
};

const useHyphen = () => useContext(HyphenContext);
export { HyphenProvider, useHyphen };

