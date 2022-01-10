import PrimaryButtonLight from "components/Buttons/PrimaryButtonLight";
import { Toggle } from "components/Toggle";
import React, { Fragment, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { defaultMaxListeners } from "stream";
import { twMerge } from "tailwind-merge";

import { Dialog, Transition } from "@headlessui/react";
import Modal from "components/Modal";
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
  const { executeApproveToken } = useTokenApproval()!;
  const { transferAmount } = useTransaction()!;

  const [infiniteApproval, setInfiniteApproval] = useState(true);

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <div className="mb-14">
        <div className="bg-white p-6 rounded-3xl shadow-2xl relative">
          <div className="absolute -inset-2 bg-white/60 opacity-50 rounded-3xl blur-lg -z-10"></div>
          <div className="flex flex-col">
            <div className="flex items-center mb-6">
              <Dialog.Title
                as="h1"
                className="font-semibold text-xl text-black text-opacity-[0.54] p-2"
              >
                Approve Details
              </Dialog.Title>
              <div className="text-hyphen-purple-dark/80 ml-auto hover">
                <button onClick={onClose}>
                  <IoMdClose className="h-6 w-auto" />
                </button>
              </div>
            </div>
            <div className="transition-colors p-4 rounded-xl bg-hyphen-purple bg-opacity-[0.05] border-hyphen-purple border border-opacity-10 hover:border-opacity-30">
              <div className="flex flex-col gap-4">
                <Dialog.Description
                  as="div"
                  className="text-hyphen-purple-dark/80 font-medium py-2 text-center"
                >
                  Allow Hyphen to spend Eth on Mumbai
                </Dialog.Description>
                <div className="flex items-center justify-center gap-4 p-4">
                  <span className="text-xs font-bold text-hyphen-purple-dark/70 uppercase">
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
                <div className="text-xs text-hyphen-purple-dark/60 font-medium text-center">
                  Note: This approval will only be used when you deposit your
                  ETH on Hyphen Contracts on Goeril for cross chain transfers.
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 pb-2 flex justify-center">
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
