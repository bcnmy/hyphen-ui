import { Disclosure } from '@headlessui/react';
import { HiOutlineChevronDown } from 'react-icons/hi';
import { useTransaction } from 'context/Transaction';

function ChangeReceiverAddress() {
  const {
    receiver: { receiverAddress },
    changeReceiver,
  } = useTransaction()!;

  return (
    <Disclosure>
      {({ open }) => (
        <div className="grid gap-2">
          <Disclosure.Button className="flex w-full items-center justify-between rounded-lg bg-hyphen-gray-100 px-4 py-2 text-left text-xxs font-bold uppercase text-hyphen-gray-400">
            <span>Change receiver address</span>
            <HiOutlineChevronDown
              className={`${
                open ? 'rotate-180 transform' : ''
              } h-5 w-5 text-gray-500`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="text-hyphen-gray-400">
            <input
              type="text"
              value={receiverAddress}
              onChange={changeReceiver}
              className="h-15 w-full rounded-lg border border-gray-200 px-4 font-mono text-base focus:border-gray-500 focus-visible:outline-none"
            />
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
}

export default ChangeReceiverAddress;
