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
          <div className="bg-white p-6 rounded-3xl shadow-2xl relative">
            <div className="absolute -inset-2 bg-white/60 opacity-50 rounded-3xl blur-lg -z-10"></div>
            <div className="flex flex-col">
              <div className="flex items-center mb-6">
                <Dialog.Title
                  as="h1"
                  className="font-semibold text-xl text-black text-opacity-[0.54] p-2"
                >
                  Transfer Details
                </Dialog.Title>
                <div className="text-hyphen-purple-dark/80 ml-auto hover">
                  <button onClick={onClose}>
                    <IoMdClose className="h-6 w-auto" />
                  </button>
                </div>
              </div>
              <div
                className="grid gap-4 place-items-stretch p-2"
                style={{ gridTemplateColumns: "1fr auto 1fr" }}
              >
                <div className="flex flex-col">
                  <div className="transition-colors p-4 rounded-t-xl bg-hyphen-purple bg-opacity-[0.02] border-hyphen-purple border border-opacity-10 hover:border-opacity-30">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-hyphen-purple-dark/70 uppercase">
                        From
                      </span>
                      <span className="text-hyphen-purple-dark/80 font-mono text-lg font-medium">
                        {transferRecord.fromChain.name}
                      </span>
                    </div>
                  </div>
                  <div className="transition-colors p-4 rounded-b-xl bg-hyphen-purple bg-opacity-[0.02] border-hyphen-purple border border-opacity-10 hover:border-opacity-30">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-hyphen-purple-dark/70 uppercase">
                        Deposited
                      </span>
                      <span className="text-hyphen-purple-dark/80 font-mono text-lg font-medium">
                        {transferRecord.depositAmount}{" "}
                        {transferRecord.token.symbol}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-16">
                  <div className="p-2 rounded-full bg-hyphen-purple bg-opacity-20 border-hyphen-purple/10 border text-hyphen-purple shadow-sm shadow-hyphen-purple/30">
                    <FaArrowRight />
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="transition-colors p-4 rounded-t-xl bg-hyphen-purple bg-opacity-[0.02] border-hyphen-purple border border-opacity-10 hover:border-opacity-30">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-hyphen-purple-dark/70 uppercase">
                        To
                      </span>
                      <span className="text-hyphen-purple-dark/80 font-mono text-lg font-medium">
                        {transferRecord.toChain.name}
                      </span>
                    </div>
                  </div>
                  <div className="transition-colors p-4 rounded-b-xl bg-hyphen-purple bg-opacity-[0.02] border-hyphen-purple border border-opacity-10 hover:border-opacity-30">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-hyphen-purple-dark/70 uppercase">
                        Received
                      </span>
                      <span className="text-hyphen-purple-dark/80 font-mono text-lg font-medium">
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
              <div className="text-center my-7 font-medium text-hyphen-purple-darker/80">
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
          <div className="mx-8 bg-gradient-to-r from-hyphen-purple-darker via-hyphen-purple-mid to-hyphen-purple-darker backdrop-blur border-white/20 border-x border-b rounded-b-md relative shadow-lg z-0">
            <div className="absolute opacity-80 -inset-[2px] bg-gradient-to-br from-white/10 to-hyphen-purple/30 blur-md -z-10"></div>
            <div className="grid grid-cols-2 text-white/75 p-6 gap-y-2">
              <span className="font-medium flex items-center gap-2">
                <FaInfoCircle />
                Amount Deposited
              </span>
              <span className="text-right font-mono">
                <>{`${transferRecord.depositAmount} ${transferRecord.token.symbol}`}</>
              </span>
              <span className="font-medium flex items-center gap-2">
                <FaInfoCircle />
                Amount Received
              </span>
              <span className="text-right font-mono">
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
              <span className="font-medium flex items-center gap-2">
                <FaInfoCircle /> Liquidity Provider Fee
              </span>
              <span className="text-right font-mono">
                <>{`${transferRecord.lpFee} ${transferRecord.token.symbol}`}</>
              </span>
              <span className="font-medium flex items-center gap-2">
                <FaInfoCircle />
                Transaction Fee
              </span>
              <span className="text-right font-mono">
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
