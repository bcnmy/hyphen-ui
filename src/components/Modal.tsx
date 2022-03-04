import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, HTMLAttributes } from 'react';

interface IModalProps extends HTMLAttributes<HTMLDivElement> {
  isVisible: boolean;
  onClose: () => void;
}

const Modal: React.FunctionComponent<IModalProps> = ({
  isVisible,
  onClose,
  children,
}) => {
  return (
    <Transition appear show={isVisible} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-20 flex justify-center px-2"
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-[2px] firefox:bg-opacity-70" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="flex max-w-lg flex-grow flex-col">
            <div className="relative my-auto">{children}</div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default Modal;
