import { Dialog } from '@headlessui/react';
import { DEFAULT_FIXED_DECIMAL_POINT } from 'config/constants';
import { formatDistanceStrict } from 'date-fns';
import { BigNumber, ethers } from 'ethers';
import {
  HiOutlineArrowNarrowRight,
  HiOutlineArrowSmRight,
} from 'react-icons/hi';
import { IoMdClose } from 'react-icons/io';
import Modal from '../../../../components/Modal';
import { ITransactionDetails } from '../UserInfoModal';

export interface ITransactionDetailModal {
  isVisible: boolean;
  onClose: () => void;
  transactionDetails: ITransactionDetails | undefined;
}

function TransactionDetailModal({
  isVisible,
  onClose,
  transactionDetails,
}: ITransactionDetailModal) {
  if (!transactionDetails) {
    return null;
  }

  const {
    amount,
    amountReceived,
    endTimestamp,
    fromChain,
    fromChainExplorerUrl,
    lpFee,
    rewardAmount,
    startTimestamp,
    toChain,
    toChainExplorerUrl,
    token,
    transactionFee,
  } = transactionDetails!;
  const transactionTime = formatDistanceStrict(
    new Date(+endTimestamp * 1000),
    new Date(+startTimestamp * 1000),
  );

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <div className="relative z-20 rounded-3xl border border-hyphen-purple-darker/50 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <Dialog.Title as="h1" className="text-xl font-semibold text-gray-700">
            Transaction details
          </Dialog.Title>
          <button onClick={onClose} className="rounded hover:bg-gray-100">
            <IoMdClose className="h-6 w-auto text-gray-500" />
          </button>
        </div>

        <article>
          <div className="flex flex-col border-b border-gray-200 pb-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Sent</span>
                <span className="text-xl font-semibold text-gray-700">
                  {amount} {token.symbol}
                </span>
                <a
                  target="_blank"
                  href={fromChainExplorerUrl}
                  rel="noreferrer"
                  className="flex items-center text-hyphen-purple"
                >
                  {fromChain.name}
                  <HiOutlineArrowSmRight className="h-5 w-5 -rotate-45" />
                </a>
              </div>
              <HiOutlineArrowNarrowRight className="h-8 w-8 text-gray-700" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Received</span>
                <span className="text-xl font-semibold text-gray-700">
                  {amountReceived} {token.symbol}
                </span>
                <a
                  target="_blank"
                  href={toChainExplorerUrl}
                  rel="noreferrer"
                  className="flex items-center text-hyphen-purple"
                >
                  {toChain.name}
                  <HiOutlineArrowSmRight className="h-5 w-5 -rotate-45" />
                </a>
              </div>
            </div>

            <span className="text-center text-gray-500">
              Tranfer completed in{' '}
              <span className="text-hyphen-purple">{transactionTime}</span>
            </span>
          </div>

          <ul className="pt-4">
            <li className="mb-1 flex justify-between">
              <span className="text-gray-500">Liquidity provider fee</span>
              <span className="text-gray-700">
                {lpFee} {token.symbol}
              </span>
            </li>
            <li className="mb-1 flex justify-between">
              <span className="text-gray-500">Reward amount</span>
              <span className="text-gray-700">
                {rewardAmount} {token.symbol}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">Transaction fee</span>
              <span className="text-gray-700">
                {transactionFee} {token.symbol}
              </span>
            </li>
          </ul>
        </article>
      </div>
    </Modal>
  );
}

export default TransactionDetailModal;
