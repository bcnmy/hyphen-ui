import React, { useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import Skeleton from "react-loading-skeleton";

import { Dialog } from "@headlessui/react";
import Modal from "components/Modal";
import { useTransaction } from "context/Transaction";
import useAsync, { Status } from "hooks/useLoading";
import { ITransferRecord } from "context/TransactionInfoModal";
import {
  HiOutlineArrowNarrowRight,
  HiOutlineArrowSmRight,
} from "react-icons/hi";
import { useChains } from "context/Chains";

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
  const { chainsList } = useChains()!;

  const {
    value: exitInfo,
    execute: getExitInfo,
    status: getExitInfoStatus,
    error: getExitInfoError,
  } = useAsync(getExitInfoFromHash);

  const fromChainExplorerUrl = `${
    chainsList.find(
      (chain) => chain.chainId === transferRecord.fromChain.chainId
    )!.explorerUrl
  }/tx/${transferRecord.depositHash}`;
  const toChainExplorerUrl = `${
    chainsList.find(
      (chain) => chain.chainId === transferRecord.toChain.chainId
    )!.explorerUrl
  }/tx/${transferRecord.exitHash}`;

  useEffect(() => {
    getExitInfo(transferRecord.exitHash);
  }, [getExitInfo, transferRecord.exitHash]);

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <div className="relative z-20 p-6 bg-white border shadow-lg rounded-3xl border-hyphen-purple-darker/50">
        <div className="flex items-center justify-between mb-6">
          <Dialog.Title as="h1" className="text-xl font-semibold text-gray-700">
            Transaction details
          </Dialog.Title>
          <button onClick={onClose} className="rounded hover:bg-gray-100">
            <IoMdClose className="w-auto h-6 text-gray-500" />
          </button>
        </div>

        <article>
          <div className="flex flex-col pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
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
                  <HiOutlineArrowSmRight className="w-5 h-5 -rotate-45" />
                </a>
              </div>
              <HiOutlineArrowNarrowRight className="w-8 h-8 text-gray-700" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Received</span>
                <span className="text-xl font-semibold text-gray-700">
                  {getExitInfoStatus === Status.SUCCESS && exitInfo ? (
                    <>
                      {exitInfo} {transferRecord.token.symbol}
                    </>
                  ) : (
                    <>
                      <Skeleton
                        baseColor="#625ccd28"
                        highlightColor="#625ccd0c"
                        width={100}
                      />
                    </>
                  )}
                </span>
                <a
                  target="_blank"
                  href={toChainExplorerUrl}
                  rel="noreferrer"
                  className="flex items-center text-hyphen-purple"
                >
                  {transferRecord.toChain.name}
                  <HiOutlineArrowSmRight className="w-5 h-5 -rotate-45" />
                </a>
              </div>
            </div>

            <span className="text-center text-gray-500">
              Tranfer completed in{" "}
              <span className="text-hyphen-purple">
                {transferRecord.transferTime}
              </span>
            </span>
          </div>

          <ul className="pt-4">
            <li className="flex justify-between mb-1">
              <span className="text-gray-500">Liquidity provider fee</span>
              <span className="text-gray-700">
                {transferRecord.lpFee} {transferRecord.token.symbol}
              </span>
            </li>
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
