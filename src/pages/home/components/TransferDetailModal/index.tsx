import { Dialog } from "@headlessui/react";
import { IoMdClose } from "react-icons/io";
import Modal from "../../../../components/Modal";

export interface ITransferDetailModal {
  isVisible: boolean;
  onClose: () => void;
}

function TransferDetailModal({ isVisible, onClose }: ITransferDetailModal) {
  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <div className="relative z-20 bg-white border shadow-lg rounded-3xl border-hyphen-purple-darker/50">
        <div className="flex items-center justify-between p-6">
          <Dialog.Title as="h1" className="text-xl font-semibold text-gray-700">
            Transfer details
          </Dialog.Title>
          <button onClick={onClose} className="rounded hover:bg-gray-100">
            <IoMdClose className="w-auto h-6 text-gray-500" />
          </button>
        </div>

        <article className="p-4 mx-6 mb-6 border border-gray-200 rounded-2xl">
          Hello World!
        </article>
      </div>
    </Modal>
  );
}

export default TransferDetailModal;
