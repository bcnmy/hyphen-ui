import Select from "components/Select";
import { TokenConfig } from "config/tokens";
import { useChains } from "context/Chains";
import { useHyphen } from "context/Hyphen";
import { useToken } from "context/Token";
import { useTransaction, ValidationErrors } from "context/Transaction";
import { Status } from "hooks/useLoading";
import React, { useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import { twMerge } from "tailwind-merge";
import CustomTooltip from "./CustomTooltip";

interface ITokenSelectorProps {
  disabled?: boolean;
}

const TokenSelector: React.FunctionComponent<ITokenSelectorProps> = ({
  disabled,
}) => {
  const {
    tokensList,
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
    return tokensList
      .filter((token) => compatibleTokensForCurrentChains.indexOf(token) !== -1)
      .map((token) => ({
        id: token.symbol,
        name: token.symbol,
        image: token.image,
      }));
  }, [fromChain, tokensList, compatibleTokensForCurrentChains]);

  return (
    <div className="flex flex-col justify-between">
      <div data-tip data-for="tokenSelect">
        <Select
          options={tokenOptions}
          selected={
            selectedToken &&
            fromChain &&
            tokenOptions.find((opt) => opt.id === selectedToken.symbol)
          }
          setSelected={(opt) => {
            fromChain &&
              changeSelectedToken(
                tokensList.find((t) => t.symbol === opt.id) as TokenConfig
              );
          }}
          label={"token"}
          disabled={disabled}
        />
        {disabled && (
          <CustomTooltip
            id="tokenSelect"
            text="Select source & destination chains"
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-4 pl-2 my-2 text-xs text-hyphen-purple-dark">
        <span className="flex items-baseline flex-grow">
          <span
            className={twMerge(
              "mr-1",
              transactionAmountValidationErrors.includes(
                ValidationErrors.INADEQUATE_BALANCE
              ) && "text-red-600",
              "transition-colors"
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
                    ValidationErrors.INADEQUATE_BALANCE
                  ) && "text-red-600",
                  "transition-colors"
                )}
              >
                {selectedTokenBalance?.displayBalance || ""}
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
          className="px-2 transition-colors border rounded-full shadow-sm text-hyphen-purple shadow-hyphen-purple/20 border-hyphen-purple border-opacity-20 hover:bg-hyphen-purple/10"
          onClick={() => {
            selectedTokenBalance &&
              poolInfo &&
              parseFloat(selectedTokenBalance.formattedBalance) &&
              changeTransferAmountInputValue(
                Math.min(
                  parseFloat(selectedTokenBalance?.displayBalance),
                  poolInfo?.maxDepositAmount
                ).toString()
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
