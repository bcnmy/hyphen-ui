import Select from 'components/Select';
import { useChains } from 'context/Chains';
import { useToken } from 'context/Token';
import { useTransaction, ValidationErrors } from 'context/Transaction';
import { Status } from 'hooks/useLoading';
import React, { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { twMerge } from 'tailwind-merge';
import CustomTooltip from '../../../components/CustomTooltip';

interface ITokenSelectorProps {
  disabled?: boolean;
}

const TokenSelector: React.FunctionComponent<ITokenSelectorProps> = ({
  disabled,
}) => {
  const {
    tokens,
    compatibleTokensForCurrentChains,
    changeSelectedToken,
    selectedTokenBalance,
    selectedToken,
    getSelectedTokenBalanceStatus,
  } = useToken()!;

  const { transactionAmountValidationErrors } = useTransaction()!;
  const { fromChain } = useChains()!;

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
        />
        {disabled && (
          <CustomTooltip id="tokenSelect">
            <span>Select source & destination chains</span>
          </CustomTooltip>
        )}
      </div>
      <div
        className={`${
          disabled ? 'bg-hyphen-gray-100' : 'bg-[#50AF95]'
        } mt-2 flex h-[30px] w-full items-end justify-center rounded-2.5 text-xxs text-hyphen-purple-dark`}
      >
        {getSelectedTokenBalanceStatus &&
        getSelectedTokenBalanceStatus === Status.SUCCESS &&
        selectedTokenBalance?.displayBalance ? (
          <div className="mb-2 flex w-full items-center justify-between px-[18px] text-xxs font-bold uppercase text-white">
            <span
              className={twMerge(
                'mr-1',
                transactionAmountValidationErrors.includes(
                  ValidationErrors.INADEQUATE_BALANCE,
                ) && 'text-red-600',
                'transition-colors',
              )}
            >
              Balance
            </span>
            <span className="font-mono">
              <span
                className={twMerge(
                  transactionAmountValidationErrors.includes(
                    ValidationErrors.INADEQUATE_BALANCE,
                  ) && 'text-red-600',
                  'transition-colors',
                )}
              >
                {selectedTokenBalance?.displayBalance || ''}
              </span>
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TokenSelector;
