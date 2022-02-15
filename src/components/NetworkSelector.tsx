import { Fragment, useEffect, useMemo, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { HiOutlineChevronDown } from 'react-icons/hi';
import { useChains } from 'context/Chains';
import switchNetwork from 'utils/switchNetwork';
import { useWalletProvider } from 'context/WalletProvider';

interface INetwork {
  id: number;
  name: string;
  image: string;
}

function NetworkSelector() {
  const { chainsList } = useChains()!;
  const { currentChainId, walletProvider } = useWalletProvider()!;
  const networks = useMemo(
    () =>
      chainsList.map(
        (chain) =>
          ({
            id: chain.chainId,
            name: chain.name,
            image: chain.image,
          } as INetwork),
      ),
    [chainsList],
  );

  const [selected, setSelected] = useState<INetwork>();

  useEffect(() => {
    const network = networks.find((network) => network.id === currentChainId);
    if (network) {
      setSelected(network);
    }
  }, [currentChainId, networks]);

  function handleNetworkChange(selectedNetwork: INetwork) {
    const network = chainsList.find(
      (chain) => chain.chainId === selectedNetwork.id,
    );
    if (walletProvider && network) {
      switchNetwork(walletProvider, network);
    }
    setSelected(selectedNetwork);
  }

  if (!selected) return null;

  return (
    <div className="w-[146px]">
      <Listbox value={selected} onChange={handleNetworkChange}>
        <div className="relative">
          <Listbox.Button className="relative h-8 w-full cursor-pointer rounded-xl bg-hyphen-purple bg-opacity-50 pl-3 pr-10 text-left focus:outline-none sm:text-sm">
            <span className="flex items-center truncate">
              <img
                src={selected.image}
                alt={selected.name}
                className="mr-2 h-5 w-5"
              />
              {selected.name}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <HiOutlineChevronDown
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-hyphen-purple py-1 text-base focus:outline-none sm:text-sm">
              {networks.map((network) => (
                <Listbox.Option
                  key={network.id}
                  className="relative flex cursor-pointer select-none items-center py-2 pl-3 pr-4 text-white hover:bg-hyphen-purple-dark hover:bg-opacity-50"
                  value={network}
                >
                  {({ selected, active }) => (
                    <>
                      <img
                        src={network.image}
                        alt={network.name}
                        className="mr-2 h-5 w-5"
                      />
                      <span
                        className={`${
                          selected ? 'font-medium' : 'font-normal'
                        } block truncate`}
                      >
                        {network.name}
                      </span>
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}

export default NetworkSelector;
