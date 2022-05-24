import PrimaryButtonLight from 'components/Buttons/PrimaryButtonLight';
import React from 'react';
import { IoMdClose } from 'react-icons/io';

import { Dialog } from '@headlessui/react';
import Modal from 'components/Modal';
import useErrorModal from 'hooks/useErrorModal';

export interface IErrorModalProps {
  error: any;
  title: string;
}

export const ErrorModal: React.FC<IErrorModalProps> = ({ error, title }) => {
  const { isErrorModalVisible: isVisible, hideErrorModal } =
    useErrorModal(error);

  return (
    <Modal isVisible={isVisible} onClose={hideErrorModal}>
      <div className="mb-14">
        <div className="relative rounded-3xl bg-white p-6 shadow-2xl">
          <div className="absolute -inset-2 -z-10 rounded-3xl bg-white/60 opacity-50 blur-lg"></div>
          <div className="flex flex-col">
            <div className="mb-6 flex items-center justify-between">
              <Dialog.Title
                as="h1"
                className="p-2 text-xl font-semibold text-black text-opacity-[0.54]"
              >
                {title}
              </Dialog.Title>
              <div className="hover ml-auto text-hyphen-purple-dark/80">
                <button onClick={hideErrorModal}>
                  <IoMdClose className="h-6 w-auto" />
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-hyphen-purple border-opacity-10 bg-hyphen-purple bg-opacity-[0.05] px-4 py-6 transition-colors hover:border-opacity-30">
              <Dialog.Description
                as="div"
                className="text py-2 text-center font-medium text-hyphen-purple-dark/80"
              >
                {error?.message}
              </Dialog.Description>
            </div>
            <div className="mt-4 flex justify-center pt-3 pb-2">
              <PrimaryButtonLight
                className="px-8"
                onClick={() => {
                  hideErrorModal();
                }}
              >
                Okay
              </PrimaryButtonLight>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ErrorModal;
