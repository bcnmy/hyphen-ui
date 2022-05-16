import Select from 'components/Select';
import { useChains } from 'context/Chains';
import { useWalletProvider } from 'context/WalletProvider';
import React, { useMemo } from 'react';
import CustomTooltip from '../../../components/CustomTooltip';
import transferArrow from 'assets/images/transfer-arrow.svg';
import GaslessToggle from './GaslessToggle';

interface INetworkSelectorsProps {}

const NetworkSelectors: React.FC<INetworkSelectorsProps> = () => {
  const { isLoggedIn } = useWalletProvider()!;
  const {
    networks,
    fromChain,
    toChain,
    changeFromChain,
    changeToChain,
    switchChains,
  } = useChains()!;

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
    <>
      <div className="relative">
        {fromChainOptions ? (
          <Select
            options={fromChainOptions}
            selected={selectedFromChain}
            setSelected={opt => {
              networks &&
                changeFromChain(
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
      <div className="mb-3 flex items-end">
        <button onClick={switchChains}>
          <img src={transferArrow} alt="Transfer" />
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
                changeToChain(
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
    </>
  );
};

export default NetworkSelectors;
