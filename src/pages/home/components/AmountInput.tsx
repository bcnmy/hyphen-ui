import { useHyphen } from "context/Hyphen";
import { Status } from "hooks/useLoading";
import Skeleton from "react-loading-skeleton";

import React from "react";
import { useTransaction, ValidationErrors } from "context/Transaction";
import { twMerge } from "tailwind-merge";

interface IAmountInputProps {}

const AmountInput: React.FunctionComponent<IAmountInputProps> = (props) => {
  const { poolInfo, getPoolInfoStatus } = useHyphen()!;
  const {
    transferAmount,
    changeTransferAmountInputValue,
    transferAmountInputValue,
    transactionAmountValidationErrors,
  } = useTransaction()!;

  return (
    <div className="text-hyphen-purple-dark flex flex-col font-mono justify-between">
      <div className="block">
        <input
          type="string"
          inputMode="decimal"
          placeholder="0.00"
          value={transferAmountInputValue}
          onChange={(e) => changeTransferAmountInputValue(e.target.value)}
          className="inline-block w-64 text-3xl font-mono font-medium bg-opacity-0 bg-white px-4 py-3 my-1 tracking-tight focus:outline-none focus-visible:ring-2 rounded-lg focus-visible:ring-opacity-10 focus-visible:ring-white focus-visible:ring-offset-hyphen-purple/30 focus-visible:ring-offset-2 focus-visible:border-indigo-500"
        />
      </div>
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
