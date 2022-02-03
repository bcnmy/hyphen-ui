import PrimaryButtonLight from "components/Buttons/PrimaryButtonLight";
import { Toggle } from "components/Toggle";
import React, { Fragment, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { defaultMaxListeners } from "stream";
import { twMerge } from "tailwind-merge";

import { Dialog } from "@headlessui/react";
import Modal from "components/Modal";
import { useChains } from "context/Chains";
import { useToken } from "context/Token";
import { useTokenApproval } from "context/TokenApproval";
import { useTransaction } from "context/Transaction";

export interface IApprovalModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const ApprovalModal: React.FC<IApprovalModalProps> = ({
  isVisible,
  onClose,
}) => {
  const { fromChain } = useChains()!;
  const { selectedToken } = useToken()!;
  const { executeApproveToken } = useTokenApproval()!;
  const { transferAmount } = useTransaction()!;

  const [infiniteApproval, setInfiniteApproval] = useState(true);

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <div className="mb-14">
        <div className="relative p-6 bg-white shadow-2xl rounded-3xl">
          <div className="absolute opacity-50 -inset-2 bg-white/60 rounded-3xl blur-lg -z-10"></div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title
                as="h1"
                className="font-semibold text-xl text-black text-opacity-[0.54] p-2"
              >
                Approve Details
              </Dialog.Title>
              <div className="ml-auto text-hyphen-purple-dark/80 hover">
                <button onClick={onClose}>
                  <IoMdClose className="w-auto h-6" />
                </button>
              </div>
            </div>
            <div className="transition-colors p-4 rounded-xl bg-hyphen-purple bg-opacity-[0.05] border-hyphen-purple border border-opacity-10 hover:border-opacity-30">
              <div className="flex flex-col gap-4">
                <Dialog.Description
                  as="div"
                  className="py-2 font-medium text-center text-hyphen-purple-dark/80"
                >
                  Allow Hyphen to spend {selectedToken?.symbol} on{" "}
                  {fromChain?.name}
                </Dialog.Description>
                <div className="flex items-center justify-center gap-4 p-4">
                  <span className="text-base font-semibold text-hyphen-purple-dark/70">
                    <div className="flex items-center gap-2">
                      <FaInfoCircle />
                      Infinite Approval
                    </div>
                  </span>
                  <Toggle
                    label="Infinite Approval"
                    enabled={infiniteApproval}
                    onToggle={setInfiniteApproval}
                  />
                </div>
                <div className="text-xs font-medium text-center text-hyphen-purple-dark/60">
                  Note: This approval will only be used when you deposit your{" "}
                  {selectedToken?.symbol} in Hyphen contracts on{" "}
                  {fromChain?.name} for cross chain transfers.
                </div>
              </div>
            </div>
            <div className="flex justify-center pt-3 pb-2 mt-4">
              <PrimaryButtonLight
                className="px-8"
                onClick={() => {
                  if (!transferAmount)
                    throw new Error("Transfer Amount Invalid");
                  executeApproveToken(infiniteApproval, transferAmount);
                  onClose();
                }}
              >
                Proceed
              </PrimaryButtonLight>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ApprovalModal;
