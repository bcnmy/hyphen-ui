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
import useErrorModal from "hooks/useErrorModal";

export interface IErrorModalProps {
  error: any;
  title: string;
}

export const ErrorModal: React.FC<IErrorModalProps> = ({ error, title }) => {
  const {
    isErrorModalVisible: isVisible,
    hideErrorModal,
    showErrorModal,
  } = useErrorModal(error);

  return (
    <Modal isVisible={isVisible} onClose={hideErrorModal}>
      <div className="mb-14">
        <div className="bg-white p-6 rounded-3xl shadow-2xl relative">
          <div className="absolute -inset-2 bg-white/60 opacity-50 rounded-3xl blur-lg -z-10"></div>
          <div className="flex flex-col">
            <div className="flex items-center mb-6">
              <Dialog.Title
                as="h1"
                className="font-semibold text-xl text-black text-opacity-[0.54] p-2"
              >
                {title}
              </Dialog.Title>
              <div className="text-hyphen-purple-dark/80 ml-auto hover">
                <button onClick={hideErrorModal}>
                  <IoMdClose className="h-6 w-auto" />
                </button>
              </div>
            </div>
            <div className="transition-colors px-4 py-6 rounded-xl bg-hyphen-purple bg-opacity-[0.05] border-hyphen-purple border border-opacity-10 hover:border-opacity-30">
                <Dialog.Description
                  as="div"
                  className="text-hyphen-purple-dark/80 text font-medium py-2 text-center"
                >
                  {error?.message}
                </Dialog.Description>
            </div>
            <div className="mt-4 pt-3 pb-2 flex justify-center">
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
