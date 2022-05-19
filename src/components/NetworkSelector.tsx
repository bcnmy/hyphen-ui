import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { HiOutlineChevronDown } from 'react-icons/hi';
import { useChains } from 'context/Chains';
import { useWalletProvider } from 'context/WalletProvider';
import switchNetwork from 'utils/switchNetwork';
import { useQueryClient } from 'react-query';
import CustomTooltip from './CustomTooltip';
import { Network } from 'hooks/useNetworks';

function NetworkSelector() {
  const queryClient = useQueryClient();

  const { walletProvider } = useWalletProvider()!;
  const {
    changeSelectedNetwork,
    networks,
    isNetworksLoading,
    selectedNetwork,
  } = useChains()!;

  async function handleNetworkChange(selectedNetwork: Network) {
    if (walletProvider) {
      const res = await switchNetwork(walletProvider, selectedNetwork);
      if (res === null) {
        queryClient.removeQueries();
        changeSelectedNetwork(selectedNetwork);
      }
    } else {
      queryClient.removeQueries();
      changeSelectedNetwork(selectedNetwork);
    }
  }

  if (!selectedNetwork)
    return (
      <>
        <div
          className="flex h-8 w-[146px] cursor-default items-center rounded-xl bg-hyphen-purple bg-opacity-50 px-3 text-left text-white"
          data-tip
          data-for="wrongNetwork"
        >
          Wrong network
        </div>
        <CustomTooltip id="wrongNetwork">
          <span>Please connect to a supported network in your wallet.</span>
        </CustomTooltip>
      </>
    );

  return (
    <div className="w-[146px]">
      <Listbox value={selectedNetwork} onChange={handleNetworkChange}>
        <div className="relative">
          <Listbox.Button className="relative h-8 w-full cursor-pointer rounded-xl bg-hyphen-purple bg-opacity-50 pl-3 pr-10 text-left focus:outline-none sm:text-sm">
            <span className="flex items-center truncate">
              {selectedNetwork.name}
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
              {isNetworksLoading ? '...' : null}

              {networks &&
                networks.map(network => (
                  <Listbox.Option
                    key={network.chainId}
                    className="relative flex cursor-pointer select-none items-center py-2 pl-3 pr-4 text-white hover:bg-hyphen-purple-dark hover:bg-opacity-50"
                    value={network}
                  >
                    {({ selected, active }) => (
                      <span
                        className={`${
                          selected ? 'font-medium' : 'font-normal'
                        } block truncate`}
                      >
                        {network.name}
                      </span>
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
