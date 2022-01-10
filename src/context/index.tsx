import React from "react";
import { BiconomyProvider } from "./Biconomy";
import { ChainsProvider } from "./Chains";
import { HyphenProvider } from "./Hyphen";
import { NotificationsProvider } from "./Notifications";
import { TokenProvider } from "./Token";
import { TokenApprovalProvider } from "./TokenApproval";
import { TransactionProvider } from "./Transaction";
import { TransactionInfoModalProvider } from "./TransactionInfoModal";
import { WalletProviderProvider } from "./WalletProvider";

export const AppProviders: React.FC = ({ children }) => {
  return (
    <WalletProviderProvider>
      <ChainsProvider>
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
      </ChainsProvider>
    </WalletProviderProvider>
  );
};

export default AppProviders;
