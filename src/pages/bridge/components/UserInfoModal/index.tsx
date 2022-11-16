import {
  ApolloClient,
  gql,
  InMemoryCache,
  NetworkStatus,
  useQuery,
} from '@apollo/client';
import { Dialog } from '@headlessui/react';
import { useChains } from 'context/Chains';
import { useHyphen } from 'context/Hyphen';
import { useToken } from 'context/Token';
import { useWalletProvider } from 'context/WalletProvider';
import { BigNumber, ethers } from 'ethers';
import useModal from 'hooks/useModal';
import { Network } from 'hooks/useNetworks';
import { Token } from 'hooks/useTokens';
import { useEffect, useState } from 'react';
import { HiOutlineArrowNarrowRight, HiOutlineRefresh } from 'react-icons/hi';
import { IoMdClose } from 'react-icons/io';
import Skeleton from 'react-loading-skeleton';
import { twMerge } from 'tailwind-merge';
import { getProviderInfo } from 'web3modal';
import Modal from '../../../../components/Modal';
import TransactionDetailModal from '../TransactionDetailModal';
import Transak from '@biconomy/transak';

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
  fromChain: Network;
  fromChainExplorerUrl: string;
  gasFee: string;
  lpFee: string;
  rewardAmount: string;
  startTimestamp: number;
  toChain: Network;
  toChainExplorerUrl: string;
  token: Token;
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
  const {
    accounts,
    disconnect,
    rawEthereumProvider,
    smartAccountAddress,
    userInfo,
  } = useWalletProvider()!;
  const { fromChain, networks } = useChains()!;
  const { tokens } = useToken()!;
  const { hyphen } = useHyphen()!;

  const [loading, setLoading] = useState(true);
  const [addressCopied, setAddressCopied] = useState(false);
  const [scwCopied, setScwCopied] = useState(false);
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
    async function getFeeInfo(exitHash: string, toChain: Network) {
      const apolloClient = new ApolloClient({
        uri: toChain.v2GraphUrl,
        cache: new InMemoryCache(),
      });
      const { data: feeInfo } = await apolloClient.query({
        query: FEE_INFO,
        variables: { exitHash: exitHash },
      });

      return feeInfo;
    }

    async function getUserTransactions(
      fromChain: Network,
      userDeposits: IUserDeposits[],
    ) {
      let transformedTransactions: any = [];
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
        const toChain = networks?.find(
          networkObj => networkObj.chainId === Number.parseInt(toChainID, 10),
        )!;
        const fromChainExplorerUrl = `${fromChain.explorerUrl}/tx/${depositHash}`;
        const toChainExplorerUrl = `${toChain.explorerUrl}/tx/${exitHash}`;
        const tokenSymbol = tokens
          ? Object.keys(tokens).find(tokenSymbol => {
              const tokenObj = tokens[tokenSymbol];
              return (
                tokenObj[fromChain.chainId]?.address.toLowerCase() ===
                tokenAddress.toLowerCase()
              );
            })
          : undefined;
        const token = tokens && tokenSymbol ? tokens[tokenSymbol] : undefined;
        const tokenDecimals = token ? token[fromChain.chainId].decimal : 18;

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
            BigNumber.from(transferFee)
              .sub(BigNumber.from(lpFee))
              .add(BigNumber.from(gasFee)),
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

    if (fromChain && networks && userDepositsData) {
      const { deposits: userDeposits } = userDepositsData;
      getUserTransactions(fromChain, userDeposits);
    }
  }, [fromChain, hyphen, networks, tokens, userDepositsData]);

  const {
    isVisible: isTransactionDetailModalVisible,
    hideModal: hideTransactionDetailModal,
    showModal: showTransactionDetailModal,
  } = useModal();

  function handleWalletDisconnect() {
    disconnect();
    onClose();
  }

  function handleUserAddressCopy(address: string, isScw: boolean = false) {
    navigator.clipboard.writeText(address || '');
    if (isScw) setScwCopied(true);
    else setAddressCopied(true);
    setTimeout(() => {
      if (isScw) setScwCopied(false);
      else setAddressCopied(false);
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
      <div className="relative z-20 overflow-hidden rounded-10 border border-hyphen-purple-darker/50 bg-white shadow-lg">
        <div className="mb-7.5 flex items-center justify-between px-7.5 pt-7.5 xl:px-12.5 xl:pt-12.5">
          <Dialog.Title as="h1" className="text-xl font-semibold text-gray-700">
            Account
          </Dialog.Title>
          <button onClick={onClose} className="rounded hover:bg-gray-100">
            <IoMdClose className="h-6 w-auto text-gray-500" />
          </button>
        </div>

        <aside className="px-7.5 xl:px-12.5">
          <div className="rounded-2.5 border-2 border-[#E5E7EB] bg-[#E5E7EB]">
            {/* <p className="relative flex h-15 w-full items-center rounded-t-2.5 bg-white px-5 font-mono text-xl text-hyphen-gray-400">
              EOA - {userAddress?.slice(0, 6)}...{userAddress?.slice(-6)}
              <button
                className="absolute top-[1.375rem] right-5 z-[2] flex h-4 items-center rounded-full bg-hyphen-purple px-1.5 text-xxs uppercase text-white"
                onClick={() => handleUserAddressCopy(userAddress || '')}
              >
                {addressCopied ? 'Copied' : 'Copy'}
              </button>
            </p> */}

            <p className="relative flex h-15 w-full items-center bg-white px-5 font-mono text-xl text-hyphen-gray-400">
              <b>SCW</b> {':'} {smartAccountAddress?.slice(0, 6)}...
              {smartAccountAddress?.slice(-6)}
              <button
                className="absolute top-[1.375rem] right-5 z-[2] flex h-4 items-center rounded-full bg-hyphen-purple px-1.5 text-xxs uppercase text-white"
                onClick={() =>
                  handleUserAddressCopy(smartAccountAddress || '', true)
                }
              >
                {scwCopied ? 'Copied' : 'Copy'}
              </button>
            </p>

            <p className="flex h-9 items-center justify-between px-5 text-xxs font-bold uppercase text-[#333333]">
              Connected with {providerName}
              <button
                className="px-2 text-xxs font-bold uppercase text-[#CC0000]"
                onClick={handleWalletDisconnect}
              >
                Disconnect
              </button>
            </p>
          </div>
        </aside>
        <div className="m-auto mt-4 justify-end rounded-2.5 px-7.5 xl:px-12.5">
          <button
            className="h-9 w-28 justify-self-end rounded-xl bg-hyphen-purple text-xs text-white"
            onClick={() => {
              // console.log("userInfo", userInfo);
              const transak = new Transak('PRODUCTION', {
                defaultCryptoCurrency: 'ETH',
                // fiatCurrency: 'INR',
                network: 'polygon',
                walletAddress: smartAccountAddress,
                email: '',
                defaultFiatAmount: 20,
                userData: {
                  firstName: userInfo?.name || '',
                  email: userInfo?.email || '',
                },
              });
              console.log('#transak', transak);
              transak.init();
            }}
          >
            Buy Tokens
          </button>
        </div>

        <aside className="mt-7.5 bg-[#F1F0FF] p-7.5 xl:mt-12.5 xl:px-12.5 xl:py-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg text-gray-700">
              {!loading && userTransactions && userTransactions.length === 0
                ? 'No Recent Transactions found'
                : 'Recent Transactions'}
            </h2>
            <button
              onClick={handleTransactionsRefetch}
              className="flex items-center rounded-md p-2 text-sm text-gray-700 hover:bg-gray-100"
            >
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

          {/* {!loading && userTransactions && userTransactions.length === 0 ? (
            <span>No transactions found 😐</span>
          ) : null} */}

          {!loading && userTransactions && userTransactions.length > 0 ? (
            <ul>
              {userTransactions.map((userTransaction: ITransactionDetails) => {
                const {
                  amount,
                  depositHash,
                  fromChain,
                  fromChainExplorerUrl,
                  toChain,
                  toChainExplorerUrl,
                  token,
                } = userTransaction;
                const { name: fromChainName } = fromChain;
                const { name: toChainName } = toChain;
                const { image, symbol } = token;

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
        </aside>
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
