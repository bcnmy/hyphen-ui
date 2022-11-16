import React from 'react';
import { BiconomyProvider } from './Biconomy';
import { ChainsProvider } from './Chains';
import { GraphQLProvider } from './GraphQL';
import { HyphenProvider } from './Hyphen';
import { NotificationsProvider } from './Notifications';
import { TokenProvider } from './Token';
import { TokenApprovalProvider } from './TokenApproval';
import { TransactionProvider } from './Transaction';
import { TransactionInfoModalProvider } from './TransactionInfoModal';
import { WalletProviderProvider } from './WalletProvider';

export const AppProviders = ({ children }) => {
  return (
    <NotificationsProvider>
      <WalletProviderProvider>
        <ChainsProvider>
          <GraphQLProvider>
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
          </GraphQLProvider>
        </ChainsProvider>
      </WalletProviderProvider>
    </NotificationsProvider>
  );
};

export default AppProviders;
