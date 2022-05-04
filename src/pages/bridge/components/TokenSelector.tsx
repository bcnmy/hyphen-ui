import Select from 'components/Select';
import { useChains } from 'context/Chains';
import { useHyphen } from 'context/Hyphen';
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
  const { poolInfo } = useHyphen()!;

  const { changeTransferAmountInputValue, transactionAmountValidationErrors } =
    useTransaction()!;
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
    <div className="flex flex-col justify-between">
      <div data-tip data-for="tokenSelect">
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

      <div className="my-2 flex items-center justify-between gap-4 pl-2 text-xs text-hyphen-purple-dark">
        <span className="flex flex-grow items-baseline">
          <span
            className={twMerge(
              'mr-1',
              transactionAmountValidationErrors.includes(
                ValidationErrors.INADEQUATE_BALANCE,
              ) && 'text-red-600',
              'transition-colors',
            )}
          >
            Balance:
          </span>
          <span className="flex-grow font-mono">
            {getSelectedTokenBalanceStatus &&
            getSelectedTokenBalanceStatus === Status.SUCCESS &&
            selectedTokenBalance?.displayBalance ? (
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
            ) : (
              <Skeleton
                baseColor="#615ccd20"
                enableAnimation={!!selectedToken}
                highlightColor="#615ccd05"
              />
            )}
          </span>
        </span>
        <button
          className="flex h-4 items-center rounded-full bg-hyphen-purple px-1.5 text-xxs text-white"
          onClick={() => {
            selectedTokenBalance &&
              poolInfo &&
              parseFloat(selectedTokenBalance.formattedBalance) &&
              changeTransferAmountInputValue(
                (
                  Math.trunc(
                    Math.min(
                      parseFloat(selectedTokenBalance?.displayBalance),
                      poolInfo?.maxDepositAmount,
                    ) * 1000,
                  ) / 1000
                ).toString(),
              );
          }}
        >
          MAX
        </button>
      </div>
    </div>
  );
};

export default TokenSelector;
