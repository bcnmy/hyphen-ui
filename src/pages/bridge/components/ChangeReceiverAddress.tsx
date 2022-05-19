import { Disclosure } from "@headlessui/react";
import { HiOutlineChevronDown } from "react-icons/hi";
import { useTransaction } from "context/Transaction";

function ChangeReceiverAddress() {
  const {
    receiver: { receiverAddress },
    changeReceiver,
  } = useTransaction()!;

  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-500 bg-hyphen-purple bg-opacity-[0.05] rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
            <span>Change receiver address</span>
            <HiOutlineChevronDown
              className={`${
                open ? "transform rotate-180" : ""
              } w-5 h-5 text-gray-500`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="text-gray-500">
            <input
              type="text"
              value={receiverAddress}
              onChange={changeReceiver}
              className="w-full h-12 px-4 text-base border border-gray-200 rounded-lg focus:border-gray-500 focus-visible:outline-none"
            />
            <span className="px-4 text-sm text-red-600">
              Note: Please do not enter a Smart Contract address.
            </span>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

export default ChangeReceiverAddress;
