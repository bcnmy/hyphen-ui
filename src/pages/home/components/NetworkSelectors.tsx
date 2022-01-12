import Select from "components/Select";
import { ChainConfig } from "config/chains";
import { useChains } from "context/Chains";
import React, { useMemo } from "react";
import { HiArrowRight } from "react-icons/hi";

interface INetworkSelectorsProps {}

const NetworkSelectors: React.FunctionComponent<INetworkSelectorsProps> = (
  props
) => {
  const {
    chainsList,
    fromChain,
    toChain,
    changeToChain,
    setFromChain,
    switchChains,
    compatibleToChainsForCurrentFromChain,
  } = useChains()!;

  const fromChainOptions = useMemo(
    () =>
      chainsList.map((chain) => ({
        id: chain.chainId,
        name: chain.name,
        image: chain.image,
      })),
    [chainsList]
  );

  const toChainOptions = useMemo(() => {
    if (!compatibleToChainsForCurrentFromChain) return [];
    else
      return compatibleToChainsForCurrentFromChain.map((chain) => ({
        id: chain.chainId,
        name: chain.name,
        image: chain.image,
      }));
  }, [compatibleToChainsForCurrentFromChain]);

  const selectedFromChain = useMemo(() => {
    if (!fromChain) return undefined;
    else return fromChainOptions.find((opt) => opt.id === fromChain.chainId);
  }, [fromChain, fromChainOptions]);

  const selectedToChain = useMemo(() => {
    if (!toChain) return undefined;
    else return toChainOptions.find((opt) => opt.id === toChain.chainId);
  }, [toChain, toChainOptions]);

  return (
    <>
      <div>
        <Select
          options={fromChainOptions}
          selected={selectedFromChain}
          setSelected={(opt) => {
            chainsList &&
              setFromChain(
                chainsList.find(
                  (chain) => chain.chainId === opt.id
                ) as ChainConfig
              );
          }}
          label={"From"}
        />
      </div>
      <div className="mx-2 mb-0.5 flex items-end">
        <button
          className="p-2 rounded-full bg-hyphen-purple bg-opacity-20 border-hyphen-purple/10 border text-hyphen-purple transition-all"
          onClick={switchChains}
        >
          <HiArrowRight />
        </button>
      </div>
      <div>
        <Select
          options={toChainOptions}
          selected={selectedToChain}
          setSelected={(opt) => {
            chainsList &&
              changeToChain(
                chainsList.find(
                  (chain) => chain.chainId === opt.id
                ) as ChainConfig
              );
          }}
          label={"To"}
        />
      </div>
    </>
  );
};

export default NetworkSelectors;
