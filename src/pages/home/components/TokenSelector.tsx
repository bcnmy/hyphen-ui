import Select from "components/Select";
import { TokenConfig } from "config/tokens";
import { useChains } from "context/Chains";
import { useHyphen } from "context/Hyphen";
import { useToken } from "context/Token";
import { useTransaction, ValidationErrors } from "context/Transaction";
import { useTransactionInfoModal } from "context/TransactionInfoModal";
import { Status } from "hooks/useLoading";
import React, { useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import { twMerge } from "tailwind-merge";

interface ITokenSelectorProps {}

const TokenSelector: React.FunctionComponent<ITokenSelectorProps> = (props) => {
  const {
    tokensList,
    compatibleTokensForCurrentChains,
    changeSelectedToken,
    selectedTokenBalance,
    selectedToken,
    getSelectedTokenBalanceStatus,
  } = useToken()!;
  const { poolInfo } = useHyphen()!;

  const { showTransactionInfoModal } = useTransactionInfoModal()!;

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
      }));
  }, [fromChain, tokensList, compatibleTokensForCurrentChains]);

  return (
    <div className="flex flex-col justify-between">
      <div>
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
          label={"Token"}
        />
      </div>
      <div className="flex p-2 text-xs font-bold gap-4 text-opacity-80 text-hyphen-purple-dark font-mono justify-between">
        <span className="flex flex-grow items-baseline">
          <span
            className={twMerge(
              "text-opacity-40 text-hyphen-purple-dark font-sans font-medium pr-2",
              transactionAmountValidationErrors.includes(
                ValidationErrors.INADEQUATE_BALANCE
              ) && "text-red-600",
              "transition-colors"
            )}
          >
            Balance:
          </span>
          <span className="flex-grow">
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
              <Skeleton baseColor="#615ccd20" highlightColor="#615ccd05" />
            )}
          </span>
        </span>
        <button
          className="text-hyphen-purple shadow-sm shadow-hyphen-purple/20 border-hyphen-purple border border-opacity-20 rounded-full px-2 hover:bg-hyphen-purple/10 transition-colors"
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
