import { useHyphen } from "context/Hyphen";
import { Status } from "hooks/useLoading";
import Skeleton from "react-loading-skeleton";

import React from "react";
import { useTransaction, ValidationErrors } from "context/Transaction";
import { twMerge } from "tailwind-merge";
import { useChains } from "context/Chains";
import CustomTooltip from "./CustomTooltip";

interface IAmountInputProps {
  disabled?: boolean;
}

const AmountInput: React.FunctionComponent<IAmountInputProps> = ({
  disabled,
}) => {
  const { poolInfo, getPoolInfoStatus } = useHyphen()!;
  const {
    transferAmount,
    changeTransferAmountInputValue,
    transferAmountInputValue,
    transactionAmountValidationErrors,
  } = useTransaction()!;

  return (
    <div className="text-hyphen-purple-dark flex flex-col font-mono justify-end">
      <div className="block" data-tip data-for="transferAmount">
        <input
          type="string"
          inputMode="decimal"
          placeholder="0.00"
          value={transferAmountInputValue}
          onChange={(e) => changeTransferAmountInputValue(e.target.value)}
          className={twMerge(
            "inline-block h-16 w-64 text-2xl font-mono font-medium bg-white px-4 py-2 my-0 tracking-tight border border-hyphen-purple border-opacity-20 focus:outline-none focus-visible:ring-2 rounded-lg focus-visible:ring-opacity-10 focus-visible:ring-white focus-visible:ring-offset-hyphen-purple/30 focus-visible:ring-offset-2 focus-visible:border-hyphen-purple",
            disabled && "cursor-not-allowed text-gray-900/80 bg-gray-200"
          )}
          disabled={disabled}
        />
      </div>
      {disabled && (
        <CustomTooltip id="transferAmount" text="Select from & to chains" />
      )}
      <div className="flex px-4 py-2 text-xs gap-4 text-opacity-60 text-hyphen-purple-dark">
        <span
          className={twMerge(
            "flex items-center gap-2 transition-colors",
            transactionAmountValidationErrors.includes(
              ValidationErrors.AMOUNT_LT_MIN
            ) && "text-red-600"
          )}
        >
          Min:
          <span className="min-w-[40px]">
            {getPoolInfoStatus === Status.SUCCESS &&
            poolInfo?.minDepositAmount ? (
              <>{poolInfo.minDepositAmount}</>
            ) : (
              <>
                <Skeleton baseColor="#615ccd20" highlightColor="#615ccd05" />
              </>
            )}
          </span>
        </span>
        <span
          className={twMerge(
            "flex items-center gap-2 transition-colors",
            transactionAmountValidationErrors.includes(
              ValidationErrors.AMOUNT_GT_MAX
            ) && "text-red-600"
          )}
        >
          Max:
          <span className="min-w-[40px]">
            {getPoolInfoStatus === Status.SUCCESS &&
            poolInfo?.maxDepositAmount ? (
              <>{poolInfo.maxDepositAmount}</>
            ) : (
              <>
                <Skeleton baseColor="#615ccd20" highlightColor="#615ccd05" />
              </>
            )}
          </span>
        </span>
      </div>
    </div>
  );
};

export default AmountInput;
