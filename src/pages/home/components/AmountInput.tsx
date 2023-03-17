import { useHyphen } from "context/Hyphen";
import { Status } from "hooks/useLoading";
import Skeleton from "react-loading-skeleton";

import React from "react";
import { useTransaction, ValidationErrors } from "context/Transaction";
import { twMerge } from "tailwind-merge";
import { useChains } from "context/Chains";
import CustomTooltip from "./CustomTooltip";
import { Listbox } from "@headlessui/react";

interface IAmountInputProps {
  disabled?: boolean;
}

const AmountInput: React.FunctionComponent<IAmountInputProps> = ({
  disabled,
}) => {
  const { poolInfo, getPoolInfoStatus } = useHyphen()!;
  const {
    changeTransferAmountInputValue,
    transferAmountInputValue,
    transactionAmountValidationErrors,
  } = useTransaction()!;

  return (
    <div className="flex flex-col justify-end text-hyphen-purple-dark">
      <div className="block" data-tip data-for="transferAmount">
        <label className="pl-1 text-xs font-semibold capitalize text-hyphen-purple-dark text-opacity-70">
          Amount
        </label>
        <input
          type="string"
          inputMode="decimal"
          placeholder="0.000"
          value={transferAmountInputValue}
          onChange={(e) => changeTransferAmountInputValue(e.target.value)}
          className={twMerge(
            "inline-block w-full h-12 text-2xl font-mono bg-white px-4 py-2 mt-1 tracking-tight border border-hyphen-purple border-opacity-20 focus:outline-none focus-visible:ring-2 rounded-lg focus-visible:ring-opacity-10 focus-visible:ring-white focus-visible:ring-offset-hyphen-purple/30 focus-visible:ring-offset-2 focus-visible:border-hyphen-purple",
            disabled && "cursor-not-allowed text-gray-900/80 bg-gray-200"
          )}
          disabled={disabled}
        />
      </div>
      {disabled && (
        <CustomTooltip
          id="transferAmount"
          text="Select source & destination chains"
        />
      )}
      <div className="flex justify-between px-2 my-2 text-xs text-hyphen-purple-dark">
        <button
          className={twMerge(
            "flex items-center transition-colors",
            transactionAmountValidationErrors.includes(
              ValidationErrors.AMOUNT_LT_MIN
            ) && "text-red-600"
          )}
          onClick={() =>
            changeTransferAmountInputValue(
              poolInfo?.minDepositAmount.toString() || ""
            )
          }
        >
          Min:
          <span className="min-w-[40px] ml-1 text-left">
            100
            {/* {getPoolInfoStatus === Status.SUCCESS &&
            poolInfo?.minDepositAmount ? (
              <>{poolInfo.minDepositAmount}</>
            ) : (
              <>
                <Skeleton
                  baseColor="#615ccd20"
                  enableAnimation={!disabled}
                  highlightColor="#615ccd05"
                />
              </>
            )} */}
          </span>
        </button>
        <button
          className={twMerge(
            "flex items-center transition-colors",
            transactionAmountValidationErrors.includes(
              ValidationErrors.AMOUNT_GT_MAX
            ) && "text-red-600"
          )}
          onClick={() =>
            changeTransferAmountInputValue(
              poolInfo?.maxDepositAmount.toString() || ""
            )
          }
        >
          Max:
          <span className="min-w-[40px] ml-1 text-left">
            {getPoolInfoStatus === Status.SUCCESS &&
            poolInfo?.maxDepositAmount ? (
              <>{poolInfo.maxDepositAmount}</>
            ) : (
              <>
                <Skeleton
                  baseColor="#615ccd20"
                  enableAnimation={!disabled}
                  highlightColor="#615ccd05"
                />
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

export default AmountInput;
