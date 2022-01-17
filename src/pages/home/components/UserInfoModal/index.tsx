import { Dialog } from "@headlessui/react";
import { IoMdClose } from "react-icons/io";
import Modal from "../../../../components/Modal";

export interface IUserInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
}

function UserInfoModal({ isVisible, onClose }: IUserInfoModalProps) {
  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <div className="relative z-20 p-6 bg-white border shadow-lg rounded-3xl border-hyphen-purple-darker/50">
        <div className="flex items-center mb-6">
          <Dialog.Title
            as="h1"
            className="font-semibold text-xl text-black text-opacity-[0.54] p-2"
          >
            Account
          </Dialog.Title>
          <div className="ml-auto text-hyphen-purple-dark/80 hover">
            <button onClick={onClose}>
              <IoMdClose className="w-auto h-6" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default UserInfoModal;
