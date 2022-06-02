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
      <div className="relative z-20 mx-auto w-full overflow-hidden rounded-10 border border-hyphen-purple-darker/50 bg-white shadow-lg xl:w-[21.875rem]">
        <div className="mb-7.5 flex items-center justify-between px-7.5 pt-7.5 xl:px-12.5 xl:pt-12.5">
          <Dialog.Title as="h1" className="text-xl font-semibold text-gray-700">
            Token Approval
          </Dialog.Title>
          <button onClick={onClose} className="rounded hover:bg-gray-100">
            <IoMdClose className="h-6 w-auto text-gray-500" />
          </button>
        </div>

        <aside className="flex flex-col items-start px-7.5 pb-7.5 xl:px-12.5 xl:pb-12.5">
          <p className="mb-7.5 text-base text-hyphen-purple">
            Allow Hyphen to spend {selectedTokenName} on {selectedChainName}
          </p>

          <div className="mb-7.5 flex items-center justify-center gap-4">
            <span className="flex items-center gap-2 text-xxs font-bold uppercase text-hyphen-purple">
              <FaInfoCircle />
              Infinite Approval
            </span>

            <Toggle
              bgColor="#00D28F"
              enabled={infiniteApproval}
              label="Infinite Approval"
              onToggle={setInfiniteApproval}
              variant="large"
            />
          </div>

          <p className="mb-7.5 text-base text-hyphen-gray-300">
            Note: This approval will only be used when you deposit your{' '}
            {selectedTokenName} in Hyphen contracts on {selectedChainName} for
            cross chain transfers.
          </p>

          <PrimaryButtonLight
            className="px-8"
            onClick={() => {
              if (!transferAmount) throw new Error('Transfer Amount Invalid');
              executeTokenApproval(infiniteApproval, transferAmount);
              onClose();
            }}
          >
            Proceed
          </PrimaryButtonLight>
        </aside>
      </div>
      {/* <div className="mx-auto mb-14 w-[calc(100%-1.5rem)] xl:w-auto">
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
              <button onClick={onClose} className="rounded hover:bg-gray-100">
                <IoMdClose className="h-6 w-auto text-gray-500" />
              </button>
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
                  <span className="flex items-center gap-2 text-xxs uppercase text-hyphen-yellow-100">
                    <FaInfoCircle />
                    Infinite Approval
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
      </div> */}
    </Modal>
  );
};

export default ApprovalModal;
