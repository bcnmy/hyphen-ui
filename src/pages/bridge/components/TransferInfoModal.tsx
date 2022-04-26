import React, { useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';

import { Dialog } from '@headlessui/react';
import Modal from 'components/Modal';
import { useTransaction } from 'context/Transaction';
import useAsync from 'hooks/useLoading';
import { ITransferRecord } from 'context/TransactionInfoModal';
import {
  HiOutlineArrowNarrowRight,
  HiOutlineArrowSmRight,
} from 'react-icons/hi';
import { useChains } from 'context/Chains';

export interface ITransferInfoModal {
  transferRecord: ITransferRecord;
  isVisible: boolean;
  onClose: () => void;
}

export const TransferInfoModal: React.FC<ITransferInfoModal> = ({
  transferRecord,
  isVisible,
  onClose,
}) => {
  const { getExitInfoFromHash } = useTransaction()!;
  const { networks } = useChains()!;

  const { execute: getExitInfo } = useAsync(getExitInfoFromHash);

  const fromChainExplorerUrl = `${
    networks?.find(
      network => network.chainId === transferRecord.fromChain.chainId,
    )!.explorerUrl
  }/tx/${transferRecord.depositHash}`;

  const toChainExplorerUrl = `${
    networks?.find(
      network => network.chainId === transferRecord.toChain.chainId,
    )!.explorerUrl
  }/tx/${transferRecord.exitHash}`;

  useEffect(() => {
    getExitInfo(transferRecord.exitHash);
  }, [getExitInfo, transferRecord.exitHash]);

  return (
    <Modal isVisible={isVisible} onClose={() => {}}>
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
                  {transferRecord.depositAmount} {transferRecord.token.symbol}
                </span>
                <a
                  target="_blank"
                  href={fromChainExplorerUrl}
                  rel="noreferrer"
                  className="flex items-center text-hyphen-purple"
                >
                  {transferRecord.fromChain.name}
                  <HiOutlineArrowSmRight className="h-5 w-5 -rotate-45" />
                </a>
              </div>
              <HiOutlineArrowNarrowRight className="h-8 w-8 text-gray-700" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Received</span>
                <span className="text-xl font-semibold text-gray-700">
                  {transferRecord.transferredAmount}{' '}
                  {transferRecord.token.symbol}
                </span>
                <a
                  target="_blank"
                  href={toChainExplorerUrl}
                  rel="noreferrer"
                  className="flex items-center text-hyphen-purple"
                >
                  {transferRecord.toChain.name}
                  <HiOutlineArrowSmRight className="h-5 w-5 -rotate-45" />
                </a>
              </div>
            </div>

            <span className="text-center text-gray-500">
              Tranfer completed in{' '}
              <span className="text-hyphen-purple">
                {transferRecord.transferTime}
              </span>
            </span>
          </div>

          <ul className="pt-4">
            <li className="mb-1 flex justify-between">
              <span className="text-gray-500">Liquidity provider fee</span>
              <span className="text-gray-700">
                {transferRecord.lpFee} {transferRecord.token.symbol}
              </span>
            </li>
            {transferRecord.rewardAmount && (
              <li className="mb-1 flex justify-between">
                <span className="text-gray-500">Reward Amount</span>
                <span className="text-gray-700">
                  {transferRecord.rewardAmount} {transferRecord.token.symbol}
                </span>
              </li>
            )}
            <li className="flex justify-between">
              <span className="text-gray-500">Transaction fee</span>
              <span className="text-gray-700">
                {transferRecord.transactionFee} {transferRecord.token.symbol}
              </span>
            </li>
          </ul>
        </article>
      </div>
    </Modal>
  );
};

export default TransferInfoModal;
