import PrimaryButtonLight from "components/Buttons/PrimaryButtonLight";
import React, { Fragment, useEffect, useState } from "react";
import { FaArrowRight, FaInfoCircle } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import Skeleton from "react-loading-skeleton";
import { twMerge } from "tailwind-merge";

import { Dialog } from "@headlessui/react";
import Modal from "components/Modal";
import { useTransaction } from "context/Transaction";
import { useToken } from "context/Token";
import useAsync, { Status } from "hooks/useLoading";
import { ITransferRecord } from "context/TransactionInfoModal";

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
  const { transactionFee, fetchTransactionFeeStatus, getExitInfoFromHash } =
    useTransaction()!;
  const { selectedToken } = useToken()!;

  const {
    value: exitInfo,
    execute: getExitInfo,
    status: getExitInfoStatus,
    error: getExitInfoError,
  } = useAsync(getExitInfoFromHash);

  useEffect(() => {
    getExitInfo(transferRecord.exitHash);
  }, [getExitInfo, transferRecord.exitHash]);

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <div className="mb-14">
        <div className="relative">
          <div className="relative p-6 bg-white shadow-2xl rounded-3xl">
            <div className="absolute opacity-50 -inset-2 bg-white/60 rounded-3xl blur-lg -z-10"></div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title
                  as="h1"
                  className="font-semibold text-xl text-black text-opacity-[0.54] p-2"
                >
                  Transfer Details
                </Dialog.Title>
                <div className="ml-auto text-hyphen-purple-dark/80 hover">
                  <button onClick={onClose}>
                    <IoMdClose className="w-auto h-6" />
                  </button>
                </div>
              </div>
              <div
                className="grid gap-4 p-2 place-items-stretch"
                style={{ gridTemplateColumns: "1fr auto 1fr" }}
              >
                <div className="flex flex-col">
                  <div className="transition-colors p-4 rounded-t-xl bg-hyphen-purple bg-opacity-[0.02] border-hyphen-purple border border-opacity-10 hover:border-opacity-30">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium uppercase text-hyphen-purple-dark/70">
                        From
                      </span>
                      <span className="font-mono text-lg font-medium text-hyphen-purple-dark/80">
                        {transferRecord.fromChain.name}
                      </span>
                    </div>
                  </div>
                  <div className="transition-colors p-4 rounded-b-xl bg-hyphen-purple bg-opacity-[0.02] border-hyphen-purple border border-opacity-10 hover:border-opacity-30">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium uppercase text-hyphen-purple-dark/70">
                        Deposited
                      </span>
                      <span className="font-mono text-lg font-medium text-hyphen-purple-dark/80">
                        {transferRecord.depositAmount}{" "}
                        {transferRecord.token.symbol}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-16">
                  <div className="p-2 border rounded-full shadow-sm bg-hyphen-purple bg-opacity-20 border-hyphen-purple/10 text-hyphen-purple shadow-hyphen-purple/30">
                    <FaArrowRight />
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="transition-colors p-4 rounded-t-xl bg-hyphen-purple bg-opacity-[0.02] border-hyphen-purple border border-opacity-10 hover:border-opacity-30">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium uppercase text-hyphen-purple-dark/70">
                        To
                      </span>
                      <span className="font-mono text-lg font-medium text-hyphen-purple-dark/80">
                        {transferRecord.toChain.name}
                      </span>
                    </div>
                  </div>
                  <div className="transition-colors p-4 rounded-b-xl bg-hyphen-purple bg-opacity-[0.02] border-hyphen-purple border border-opacity-10 hover:border-opacity-30">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium uppercase text-hyphen-purple-dark/70">
                        Received
                      </span>
                      <span className="font-mono text-lg font-medium text-hyphen-purple-dark/80">
                        {getExitInfoStatus === Status.SUCCESS && exitInfo ? (
                          <>
                            {exitInfo} {transferRecord.token.symbol}
                          </>
                        ) : (
                          <>
                            <Skeleton
                              baseColor="#625ccd28"
                              highlightColor="#625ccd0c"
                            />
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="font-medium text-center my-7 text-hyphen-purple-darker/80">
                Transfer completed in{" "}
                <span className="font-semibold text-hyphen-purple">
                  {transferRecord.transferTime} 🚀
                </span>
              </div>
              <div className="flex justify-center mb-3">
                <PrimaryButtonLight
                  className="px-8"
                  onClick={() => {
                    onClose();
                  }}
                >
                  Import {transferRecord.token.symbol} to wallet
                </PrimaryButtonLight>
              </div>
            </div>
          </div>
          <div className="relative z-0 mx-8 border-b shadow-lg bg-gradient-to-r from-hyphen-purple-darker via-hyphen-purple-mid to-hyphen-purple-darker backdrop-blur border-white/20 border-x rounded-b-md">
            <div className="absolute opacity-80 -inset-[2px] bg-gradient-to-br from-white/10 to-hyphen-purple/30 blur-md -z-10"></div>
            <div className="grid grid-cols-2 p-6 text-white/75 gap-y-2">
              <span className="flex items-center gap-2 font-medium">
                <FaInfoCircle />
                Amount Deposited
              </span>
              <span className="font-mono text-right">
                <>{`${transferRecord.depositAmount} ${transferRecord.token.symbol}`}</>
              </span>
              <span className="flex items-center gap-2 font-medium">
                <FaInfoCircle />
                Amount Received
              </span>
              <span className="font-mono text-right">
                {getExitInfoStatus === Status.SUCCESS && exitInfo ? (
                  <>
                    {exitInfo} {transferRecord.token.symbol}
                  </>
                ) : (
                  <Skeleton
                    baseColor="#ffffff10"
                    highlightColor="#ffffff15"
                    className="max-w-[80px]"
                  />
                )}
              </span>
              <span className="flex items-center gap-2 font-medium">
                <FaInfoCircle /> Liquidity Provider Fee
              </span>
              <span className="font-mono text-right">
                <>{`${transferRecord.lpFee} ${transferRecord.token.symbol}`}</>
              </span>
              <span className="flex items-center gap-2 font-medium">
                <FaInfoCircle />
                Transaction Fee
              </span>
              <span className="font-mono text-right">
                <>{`${transferRecord.transactionFee} ${transferRecord.token.symbol}`}</>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TransferInfoModal;
