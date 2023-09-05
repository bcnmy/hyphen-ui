import React from "react";
import { BiconomyProvider } from "./Biconomy";
import { ChainsProvider } from "./Chains";
import { GraphQLProvider } from "./GraphQL";
import { HyphenProvider } from "./Hyphen";
import { NotificationsProvider } from "./Notifications";
import { TokenProvider } from "./Token";
import { TokenApprovalProvider } from "./TokenApproval";
import { TransactionProvider } from "./Transaction";
import { TransactionInfoModalProvider } from "./TransactionInfoModal";
import { WalletProviderProvider } from "./WalletProvider";
import "@rainbow-me/rainbowkit/styles.css";
import { createContext, useContext, useEffect, useState } from "react";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { polygon, polygonMumbai } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { ethers } from "ethers";

export const AppProviders: React.FC = ({ children }) => {
    const { chains, publicClient } = configureChains(
        [polygon, polygonMumbai],
        [publicProvider()]
    );

    const { connectors } = getDefaultWallets({
        appName: "Biconomy Instant Cross-Chain Transfers",
        projectId: "8365ba3a83054a92bac3585c1ecaa139",
        chains,
    });

    const wagmiConfig = createConfig({
        autoConnect: true,
        connectors,
        publicClient,
    });

    return (
        <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={chains}>
                <WalletProviderProvider>
                    <ChainsProvider>
                        <GraphQLProvider>
                            <NotificationsProvider>
                                <TokenProvider>
                                    <BiconomyProvider>
                                        <HyphenProvider>
                                            <TokenApprovalProvider>
                                                <TransactionProvider>
                                                    <TransactionInfoModalProvider>
                                                        {children}
                                                    </TransactionInfoModalProvider>
                                                </TransactionProvider>
                                            </TokenApprovalProvider>
                                        </HyphenProvider>
                                    </BiconomyProvider>
                                </TokenProvider>
                            </NotificationsProvider>
                        </GraphQLProvider>
                    </ChainsProvider>
                </WalletProviderProvider>
            </RainbowKitProvider>
        </WagmiConfig>
    );
};

export default AppProviders;

