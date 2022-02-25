import PrimaryButtonLight from 'components/Buttons/PrimaryButtonLight';
import { Toggle } from 'components/Toggle';
import React, { useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

import { Dialog } from '@headlessui/react';
import Modal from 'components/Modal';

export interface IApprovalModalProps {
  executeTokenApproval: (isInfiniteApproval: boolean, amount: number) => void;
  isVisible: boolean;
  onClose: () => void;
  selectedChainName: string;
  selectedTokenName: string;
  transferAmount: number;
}

export const ApprovalModal: React.FC<IApprovalModalProps> = ({
  executeTokenApproval,
  isVisible,
  onClose,
  selectedChainName,
  selectedTokenName,
  transferAmount,
}) => {
  const [infiniteApproval, setInfiniteApproval] = useState(true);

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <div className="mb-14">
        <div className="relative rounded-3xl bg-white p-6 shadow-2xl">
          <div className="absolute -inset-2 -z-10 rounded-3xl bg-white/60 opacity-50 blur-lg"></div>
          <div className="flex flex-col">
            <div className="mb-6 flex items-center justify-between">
              <Dialog.Title
                as="h1"
                className="p-2 text-xl font-semibold text-black text-opacity-[0.54]"
              >
                Token Approval
              </Dialog.Title>
              <div className="hover ml-auto text-hyphen-purple-dark/80">
                <button onClick={onClose}>
                  <IoMdClose className="h-6 w-auto" />
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-hyphen-purple border-opacity-10 bg-hyphen-purple bg-opacity-[0.05] p-4 transition-colors hover:border-opacity-30">
              <div className="flex flex-col gap-4">
                <Dialog.Description
                  as="div"
                  className="py-2 text-center font-medium text-hyphen-purple-dark/80"
                >
                  Allow Hyphen to spend {selectedTokenName} on{' '}
                  {selectedChainName}
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
                <div className="text-center text-xs font-medium text-hyphen-purple-dark/60">
                  Note: This approval will only be used when you deposit your{' '}
                  {selectedTokenName} in Hyphen contracts on {selectedChainName}{' '}
                  for cross chain transfers.
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-center pt-3 pb-2">
              <PrimaryButtonLight
                className="px-8"
                onClick={() => {
                  if (!transferAmount)
                    throw new Error('Transfer Amount Invalid');
                  executeTokenApproval(infiniteApproval, transferAmount);
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
