import Select from 'components/Select';
import { useChains } from 'context/Chains';
import { useToken } from 'context/Token';
import { Status } from 'hooks/useLoading';
import React, { useEffect, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import isTokenValidForChains from 'utils/isTokenValidForChains';
import CustomTooltip from '../../../components/CustomTooltip';

interface ITokenSelectorProps {
  disabled?: boolean;
  tokenSymbol?: string;
}

const TokenSelector: React.FunctionComponent<ITokenSelectorProps> = ({
  disabled,
  tokenSymbol,
}) => {
  const {
    tokens,
    compatibleTokensForCurrentChains,
    changeSelectedToken,
    selectedTokenBalance,
    selectedToken,
    getSelectedTokenBalanceStatus,
  } = useToken()!;
  const { fromChain, toChain } = useChains()!;

  useEffect(() => {
    // Set selected token to undefined.
    // this ensures that we start from scratch
    // when source & destination chains change.
    changeSelectedToken(undefined);

    if (
      !toChain ||
      !fromChain ||
      !(
        compatibleTokensForCurrentChains &&
        compatibleTokensForCurrentChains.length > 0
      )
    ) {
      return;
    }

    // If tokenSymbol is available try setting
    // selectedToken to that token.
    const token = tokens && tokenSymbol ? tokens[tokenSymbol] : undefined;
    if (token) {
      if (isTokenValidForChains(token, fromChain, toChain)) {
        changeSelectedToken(tokenSymbol);
      }
    } else {
      changeSelectedToken(compatibleTokensForCurrentChains[0].symbol);
    }
  }, [
    changeSelectedToken,
    compatibleTokensForCurrentChains,
    fromChain,
    toChain,
    tokenSymbol,
    tokens,
  ]);

  const tokenOptions = useMemo(() => {
    if (!fromChain || !compatibleTokensForCurrentChains) return [];
    return tokens
      ? Object.keys(tokens)
          .filter(tokenSymbol => {
            const token = tokens[tokenSymbol];
            return compatibleTokensForCurrentChains.indexOf(token) !== -1;
          })
          .map(tokenSymbol => ({
            id: tokens[tokenSymbol].symbol,
            name: tokens[tokenSymbol].symbol,
            image: tokens[tokenSymbol].image,
          }))
      : [];
  }, [compatibleTokensForCurrentChains, fromChain, tokens]);

  return (
    <div className="flex flex-col items-center justify-between">
      <div data-tip data-for="tokenSelect" className="w-full">
        <Select
          options={tokenOptions}
          selected={
            selectedToken &&
            fromChain &&
            tokenOptions.find(opt => opt.id === selectedToken.symbol)
          }
          setSelected={opt => {
            fromChain &&
              changeSelectedToken(
                tokens
                  ? Object.keys(tokens).find(
                      tokenSymbol => tokenSymbol === opt.id,
                    )
                  : '',
              );
          }}
          label={'token'}
          disabled={disabled}
          className="rounded-b-none bg-white"
          style={{
            borderColor: disabled ? '' : selectedToken?.color,
          }}
        />
        {disabled && (
          <CustomTooltip id="tokenSelect">
            <span>Select source & destination chains</span>
          </CustomTooltip>
        )}
      </div>
      <div
        className={`flex h-[30px] w-full items-center justify-center rounded-b-2.5 text-xxs text-hyphen-purple-dark`}
        style={{
          backgroundColor: disabled ? '#E5E5E5' : selectedToken?.color,
        }}
      >
        {getSelectedTokenBalanceStatus &&
        getSelectedTokenBalanceStatus === Status.SUCCESS &&
        selectedTokenBalance?.displayBalance ? (
          <div className="flex w-full items-center justify-between px-[18px] text-xxs font-bold uppercase text-white">
            <span className="mr-1">Balance</span>
            <span className="font-mono">
              <span>{selectedTokenBalance?.displayBalance || ''}</span>
            </span>
          </div>
        ) : getSelectedTokenBalanceStatus &&
          getSelectedTokenBalanceStatus === Status.PENDING ? (
          <div className="flex w-full items-center justify-between px-[18px] text-xxs font-bold uppercase text-white">
            <span className="mr-1">Balance</span>
            <Skeleton
              baseColor="#ffffff50"
              enableAnimation
              highlightColor="#615ccd05"
              className="!w-28"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TokenSelector;
