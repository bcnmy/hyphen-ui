import { useEffect, useState } from 'react';
import { gql, NetworkStatus, useQuery } from '@apollo/client';
import { BigNumber, ethers } from 'ethers';
import { Dialog } from '@headlessui/react';
import Skeleton from 'react-loading-skeleton';
import { useWalletProvider } from 'context/WalletProvider';
import { apolloClients } from 'context/GraphQL';
import { IoMdClose } from 'react-icons/io';
import {
  HiOutlineClipboardCopy,
  HiOutlineClipboardCheck,
  HiOutlineArrowNarrowRight,
  HiOutlineRefresh,
} from 'react-icons/hi';
import Modal from '../../../../components/Modal';
import { getProviderInfo } from 'web3modal';
import { useChains } from 'context/Chains';
import { TokenConfig, tokens } from '../../../../config/tokens';
import { ChainConfig, chains } from '../../../../config/chains';
import TransactionDetailModal from '../TransactionDetailModal';
import useModal from 'hooks/useModal';
import { twMerge } from 'tailwind-merge';
import { useHyphen } from 'context/Hyphen';

export interface IUserInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export interface IUserDeposits {
  id: string;
  amount: string;
  rewardAmount: string;
  timestamp: string;
  tokenAddress: string;
  toChainID: string;
}

export interface ITransactionDetails {
  amount: string;
  amountReceived: string;
  depositHash: string;
  endTimestamp: number;
  exitHash: string;
  fromChain: ChainConfig;
  fromChainExplorerUrl: string;
  gasFee: string;
  lpFee: string;
  rewardAmount: string;
  startTimestamp: number;
  toChain: ChainConfig;
  toChainExplorerUrl: string;
  token: TokenConfig;
  transactionFee: string;
}

const USER_DEPOSITS = gql`
  query USER_DEPOSITS($address: String!) {
    deposits(
      first: 5
      where: { sender: $address }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      amount
      rewardAmount
      timestamp
      tokenAddress
      toChainID
    }
  }
`;

const FEE_INFO = gql`
  query FEE_INFO($exitHash: String!) {
    assetSentToUserLogEntries(where: { id: $exitHash }) {
      gasFee
      lpFee
      timestamp
      transferFee
    }
  }
`;

function UserInfoModal({ isVisible, onClose }: IUserInfoModalProps) {
  const { accounts, disconnect, rawEthereumProvider } = useWalletProvider()!;
  const { fromChain } = useChains()!;
  const { hyphen } = useHyphen()!;

  const [loading, setLoading] = useState(true);
  const [addressCopied, setAddressCopied] = useState(false);
  const [userTransactions, setUserTransactions] = useState<any>();
  const [transactionDetails, setTransactionDetails] =
    useState<ITransactionDetails>();

  const { name: providerName } = getProviderInfo(rawEthereumProvider);
  const userAddress = accounts?.[0];
  const {
    data: userDepositsData,
    networkStatus,
    refetch,
  } = useQuery(USER_DEPOSITS, {
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
    skip: !isVisible,
    variables: { address: userAddress },
  });

  useEffect(() => {
    async function getFeeInfo(exitHash: string, toChain: ChainConfig) {
      const apolloClient = apolloClients[toChain.chainId];
      const { data: feeInfo } = await apolloClient.query({
        query: FEE_INFO,
        variables: { exitHash: exitHash },
      });

      return feeInfo;
    }

    async function getUserTransactions(
      fromChain: ChainConfig,
      userDeposits: IUserDeposits[],
    ) {
      let transformedTransactions = [];
      for (const userDeposit of userDeposits) {
        const {
          id: depositHash,
          amount,
          rewardAmount,
          timestamp: startTimestamp,
          tokenAddress,
          toChainID,
        } = userDeposit;

        const { exitHash } = await hyphen.depositManager.checkDepositStatus({
          depositHash,
          fromChainId: fromChain.chainId,
        });
        const toChain = chains.find(
          chainObj => chainObj.chainId === Number.parseInt(toChainID, 10),
        )!;
        const fromChainExplorerUrl = `${fromChain.explorerUrl}/tx/${depositHash}`;
        const toChainExplorerUrl = `${toChain.explorerUrl}/tx/${exitHash}`;
        const token = tokens.find(
          tokenObj =>
            tokenObj[fromChain.chainId]?.address.toLowerCase() ===
            tokenAddress.toLowerCase(),
        )!;
        const tokenDecimals = token[fromChain.chainId].decimal;

        const { assetSentToUserLogEntries } = await getFeeInfo(
          exitHash,
          toChain,
        );
        const {
          gasFee,
          lpFee,
          timestamp: endTimestamp,
          transferFee,
        } = assetSentToUserLogEntries[0];

        const amountReceived = BigNumber.from(amount)
          .add(BigNumber.from(rewardAmount))
          .sub(BigNumber.from(transferFee))
          .sub(BigNumber.from(gasFee));

        const formattedAmount = Number.parseFloat(
          ethers.utils.formatUnits(
            BigNumber.from(amount).sub(BigNumber.from(rewardAmount)),
            tokenDecimals,
          ),
        ).toFixed(3);

        const formattedAmountReceived = Number.parseFloat(
          ethers.utils.formatUnits(amountReceived, tokenDecimals),
        ).toFixed(3);

        const formattedRewardAmount = Number.parseFloat(
          ethers.utils.formatUnits(rewardAmount, tokenDecimals),
        ).toFixed(3);

        const formattedGasFee = Number.parseFloat(
          ethers.utils.formatUnits(gasFee, tokenDecimals),
        ).toFixed(3);

        const formattedLpFee = Number.parseFloat(
          ethers.utils.formatUnits(lpFee, tokenDecimals),
        ).toFixed(3);

        const formattedTransactionFee = Number.parseFloat(
          ethers.utils.formatUnits(
            BigNumber.from(transferFee).sub(BigNumber.from(lpFee)).add(BigNumber.from(gasFee)),
            tokenDecimals,
          ),
        ).toFixed(3);

        const transactionDetails = {
          amount: formattedAmount,
          amountReceived: formattedAmountReceived,
          depositHash,
          endTimestamp,
          exitHash,
          fromChain,
          fromChainExplorerUrl,
          gasFees: formattedGasFee,
          lpFee: formattedLpFee,
          rewardAmount: formattedRewardAmount,
          startTimestamp,
          toChain,
          toChainExplorerUrl,
          token,
          transactionFee: formattedTransactionFee,
        };

        transformedTransactions.push(transactionDetails);
      }

      setUserTransactions(transformedTransactions);
      setLoading(false);
    }

    if (fromChain && userDepositsData) {
      const { deposits: userDeposits } = userDepositsData;
      getUserTransactions(fromChain, userDeposits);
    }
  }, [fromChain, hyphen, userDepositsData]);

  const {
    isVisible: isTransactionDetailModalVisible,
    hideModal: hideTransactionDetailModal,
    showModal: showTransactionDetailModal,
  } = useModal();

  function handleWalletDisconnect() {
    disconnect();
    onClose();
  }

  function handleUserAddressCopy() {
    navigator.clipboard.writeText(userAddress || '');
    setAddressCopied(true);
    setTimeout(() => {
      setAddressCopied(false);
    }, 1500);
  }

  function handleDetailsOpen(userTransaction: ITransactionDetails) {
    setTransactionDetails(userTransaction);
    showTransactionDetailModal();
  }

  function handleDetailsClose() {
    setTransactionDetails(undefined);
    hideTransactionDetailModal();
  }

  function handleTransactionsRefetch() {
    setLoading(true);
    refetch();
  }

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <div className="relative z-20 rounded-3xl border border-hyphen-purple-darker/50 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <Dialog.Title as="h1" className="text-xl font-semibold text-gray-700">
            Account
          </Dialog.Title>
          <button onClick={onClose} className="rounded hover:bg-gray-100">
            <IoMdClose className="h-6 w-auto text-gray-500" />
          </button>
        </div>

        <article className="mb-6 rounded-2xl border border-gray-200 p-4">
          <header className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Connected with {providerName}
            </p>
            <button
              className="text-sm font-medium text-red-600"
              onClick={handleWalletDisconnect}
            >
              Disconnect
            </button>
          </header>
          <p className="mb-2 text-lg text-gray-700">
            {userAddress?.slice(0, 6)}...{userAddress?.slice(-6)}
          </p>
          <button className="flex items-center" onClick={handleUserAddressCopy}>
            {addressCopied ? (
              <HiOutlineClipboardCheck className="mr-1 h-4 w-auto text-green-400" />
            ) : (
              <HiOutlineClipboardCopy className="mr-1 h-4 w-auto text-gray-500" />
            )}
            <span
              className={`text-sm ${
                addressCopied ? 'text-green-400' : 'text-gray-500'
              }`}
            >
              {addressCopied ? 'Copied!' : 'Copy Address'}
            </span>
          </button>
        </article>

        <article>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg text-gray-700">Recent Transactions</h2>
            <button
              onClick={handleTransactionsRefetch}
              className="flex items-center rounded-md p-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Refresh
              <HiOutlineRefresh
                className={twMerge(
                  'ml-1 h-4 w-4 text-gray-500',
                  networkStatus === NetworkStatus.refetch ? 'animate-spin' : '',
                )}
              />
            </button>
          </div>
          {loading ? (
            <Skeleton
              baseColor="#615ccd20"
              count={1}
              highlightColor="#615ccd05"
              height={60}
            />
          ) : null}

          {!loading && userTransactions && userTransactions.length === 0 ? (
            <span>No transactions found 😐</span>
          ) : null}

          {!loading && userTransactions && userTransactions.length > 0 ? (
            <ul>
              {userTransactions.map((userTransaction: ITransactionDetails) => {
                const {
                  amount,
                  depositHash,
                  exitHash,
                  fromChain,
                  fromChainExplorerUrl,
                  rewardAmount,
                  toChain,
                  toChainExplorerUrl,
                  token,
                } = userTransaction;
                const { chainId: fromChainId, name: fromChainName } = fromChain;
                const { name: toChainName } = toChain;
                const {
                  image,
                  symbol,
                  [fromChainId]: { decimal: tokenDecimals },
                } = token;

                return (
                  <li
                    className="mb-2 flex items-center justify-between p-2 last:mb-0"
                    key={depositHash}
                  >
                    <div className="flex items-center">
                      <img
                        src={image}
                        alt={symbol}
                        className="mr-4 h-10 w-10"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                          {amount} {symbol}
                        </span>
                        <span className="flex items-center text-sm">
                          <a
                            target="_blank"
                            href={fromChainExplorerUrl}
                            rel="noreferrer"
                            className="text-hyphen-purple"
                          >
                            {fromChainName}
                          </a>
                          <HiOutlineArrowNarrowRight className="mx-1 h-4 w-4 text-gray-500" />
                          <a
                            target="_blank"
                            href={toChainExplorerUrl}
                            rel="noreferrer"
                            className="text-hyphen-purple"
                          >
                            {toChainName}
                          </a>
                        </span>
                      </div>
                    </div>
                    <button
                      className="flex items-center rounded-md p-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleDetailsOpen(userTransaction)}
                    >
                      Details
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </article>
      </div>

      <TransactionDetailModal
        isVisible={isTransactionDetailModalVisible}
        onClose={handleDetailsClose}
        transactionDetails={transactionDetails}
      />
    </Modal>
  );
}

export default UserInfoModal;
