import { useHyphen } from 'context/Hyphen';
import { Status } from 'hooks/useLoading';
import Skeleton from 'react-loading-skeleton';

import React from 'react';
import { useTransaction, ValidationErrors } from 'context/Transaction';
import { twMerge } from 'tailwind-merge';
import CustomTooltip from '../../../components/CustomTooltip';

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
      <div className="flex flex-col" data-tip data-for="transferAmount">
        <label className="pl-5 text-xxs font-semibold uppercase text-hyphen-gray-400">
          Amount
        </label>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.000"
          value={transferAmountInputValue}
          onChange={e => changeTransferAmountInputValue(e.target.value)}
          className={twMerge(
            'mt-2 inline-block h-15 w-full rounded-2.5 border bg-white px-4 py-2 font-mono text-2xl text-hyphen-gray-400 focus:outline-none',
            disabled && 'cursor-not-allowed bg-gray-200',
          )}
          disabled={disabled}
        />
      </div>
      {disabled && (
        <CustomTooltip id="transferAmount">
          <span>Select source & destination chains</span>
        </CustomTooltip>
      )}
      <div className="my-2 flex justify-between px-2 text-xs text-hyphen-purple-dark">
        <button
          className={twMerge(
            'flex items-center transition-colors',
            transactionAmountValidationErrors.includes(
              ValidationErrors.AMOUNT_LT_MIN,
            ) && 'text-red-600',
          )}
          onClick={() =>
            changeTransferAmountInputValue(
              poolInfo?.minDepositAmount.toString() || '',
            )
          }
        >
          Min:
          <span className="ml-1 min-w-[40px] text-left">
            {getPoolInfoStatus === Status.SUCCESS &&
            poolInfo?.minDepositAmount ? (
              <>{Math.trunc(poolInfo.minDepositAmount * 100000) / 100000}</>
            ) : (
              <>
                <Skeleton
                  baseColor="#615ccd20"
                  enableAnimation={
                    !disabled || getPoolInfoStatus === Status.PENDING
                  }
                  highlightColor="#615ccd05"
                />
              </>
            )}
          </span>
        </button>
        <button
          className={twMerge(
            'flex items-center transition-colors',
            transactionAmountValidationErrors.includes(
              ValidationErrors.AMOUNT_GT_MAX,
            ) && 'text-red-600',
          )}
          onClick={() =>
            changeTransferAmountInputValue(
              poolInfo?.maxDepositAmount.toString() || '',
            )
          }
        >
          Max:
          <span className="ml-1 min-w-[40px] text-left">
            {getPoolInfoStatus === Status.SUCCESS &&
            poolInfo?.maxDepositAmount ? (
              <>{Math.trunc(poolInfo.maxDepositAmount * 100000) / 100000}</>
            ) : (
              <>
                <Skeleton
                  baseColor="#615ccd20"
                  enableAnimation={
                    !disabled || getPoolInfoStatus === Status.PENDING
                  }
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
