import Select from 'components/Select';
import { useChains } from 'context/Chains';
import { useWalletProvider } from 'context/WalletProvider';
import React, { useEffect, useMemo } from 'react';
import CustomTooltip from '../../../components/CustomTooltip';
import transferArrow from 'assets/images/transfer-arrow.svg';
import GaslessToggle from './GaslessToggle';

interface INetworkSelectorsProps {
  sourceChainId?: string;
  destinationChainId?: string;
}

const NetworkSelectors: React.FC<INetworkSelectorsProps> = ({
  sourceChainId,
  destinationChainId,
}) => {
  const { isLoggedIn } = useWalletProvider()!;
  const {
    networks,
    fromChain,
    toChain,
    setFromChain,
    setToChain,
    switchChains,
  } = useChains()!;

  useEffect(() => {
    if (sourceChainId && destinationChainId) {
      const sourceChain = networks?.find(
        network => network.chainId === Number.parseInt(sourceChainId),
      );
      const destinationChain = networks?.find(
        network => network.chainId === Number.parseInt(destinationChainId),
      );

      if (sourceChain && destinationChain) {
        setFromChain(sourceChain);
        setToChain(destinationChain);
      }
    }
  }, [destinationChainId, networks, setFromChain, setToChain, sourceChainId]);

  const fromChainOptions = useMemo(
    () =>
      networks?.map(network => ({
        id: network.chainId,
        name: network.name,
        image: network.image,
      })),
    [networks],
  );

  const toChainOptions = useMemo(() => {
    return networks
      ?.filter(network => network.chainId !== fromChain?.chainId)
      .map(network => ({
        id: network.chainId,
        name: network.name,
        image: network.image,
      }));
  }, [fromChain?.chainId, networks]);

  const selectedFromChain = useMemo(() => {
    if (!fromChain) return undefined;
    else return fromChainOptions?.find(opt => opt.id === fromChain.chainId);
  }, [fromChain, fromChainOptions]);

  const selectedToChain = useMemo(() => {
    if (!toChain) return undefined;
    else return toChainOptions?.find(opt => opt.id === toChain.chainId);
  }, [toChain, toChainOptions]);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_40px_1fr]">
      <div className="relative">
        {fromChainOptions ? (
          <Select
            options={fromChainOptions}
            selected={selectedFromChain}
            setSelected={opt => {
              networks &&
                setFromChain(
                  networks.find(network => network.chainId === opt.id)!,
                );
            }}
            label={'source'}
          />
        ) : (
          '...'
        )}
        <div className="absolute top-0 right-4">
          <GaslessToggle />
        </div>
      </div>
      <div className="flex items-end justify-center xl:mb-3">
        <button onClick={switchChains}>
          <img
            src={transferArrow}
            alt="Transfer"
            className="h-7.5 w-7.5 rotate-90 xl:h-auto xl:w-auto xl:rotate-0"
          />
        </button>
      </div>
      <div data-tip data-for="networkSelect">
        {toChainOptions ? (
          <Select
            disabled={!isLoggedIn}
            options={toChainOptions}
            selected={selectedToChain}
            setSelected={opt => {
              networks &&
                setToChain(
                  networks.find(network => network.chainId === opt.id)!,
                );
            }}
            label={'destination'}
          />
        ) : (
          '...'
        )}
        {!isLoggedIn && (
          <CustomTooltip id="networkSelect">
            <span>Please connect your wallet</span>
          </CustomTooltip>
        )}
      </div>
    </div>
  );
};

export default NetworkSelectors;
