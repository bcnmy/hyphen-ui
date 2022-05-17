import React from 'react';
import { useHyphen } from 'context/Hyphen';
import { Status } from 'hooks/useLoading';
import Skeleton from 'react-loading-skeleton';
import { useTransaction, ValidationErrors } from 'context/Transaction';
import { twMerge } from 'tailwind-merge';
import CustomTooltip from '../../../components/CustomTooltip';
import { useToken } from 'context/Token';

interface IAmountInputProps {
  disabled?: boolean;
}

const AmountInput: React.FunctionComponent<IAmountInputProps> = ({
  disabled,
}) => {
  const { poolInfo, getPoolInfoStatus } = useHyphen()!;
  const { selectedTokenBalance } = useToken()!;
  const {
    changeTransferAmountInputValue,
    transferAmountInputValue,
    transactionAmountValidationErrors,
  } = useTransaction()!;

  return (
    <div className="flex flex-col justify-end text-hyphen-purple-dark">
      <div
        className="flex flex-col items-center"
        data-tip
        data-for="transferAmount"
      >
        <label className="self-start pl-5 text-xxxs font-semibold uppercase text-hyphen-gray-400 xl:text-xxs">
          Amount
        </label>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.000"
          value={transferAmountInputValue}
          onChange={e => changeTransferAmountInputValue(e.target.value)}
          className={twMerge(
            'mt-2 inline-block h-15 w-full rounded-2.5 border border-hyphen-gray-100 bg-white px-4 py-2 font-mono text-2xl text-hyphen-gray-400 focus:outline-none',
            disabled && 'cursor-not-allowed bg-hyphen-gray-100',
          )}
          disabled={disabled}
        />
        <button
          className="absolute top-[2.875rem] right-4 z-[2] flex h-4 items-center rounded-full bg-hyphen-purple px-1.5 text-xxs text-white"
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
      {disabled && (
        <CustomTooltip id="transferAmount">
          <span>Select source & destination chains</span>
        </CustomTooltip>
      )}
      <div className="mt-2 flex h-[30px] w-full items-center justify-between rounded-2.5 bg-hyphen-gray-100 px-[18px] text-xxs text-hyphen-purple-dark">
        {getPoolInfoStatus === Status.SUCCESS &&
        poolInfo?.minDepositAmount &&
        poolInfo?.maxDepositAmount ? (
          <>
            <button
              className={twMerge(
                'flex items-center font-bold uppercase transition-colors',
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
              <span className="ml-1 text-left">
                {Math.trunc(poolInfo.minDepositAmount * 100000) / 100000}
              </span>
            </button>
            <button
              className={twMerge(
                'transition-color flex items-center justify-end font-bold uppercase',
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
              <span className="ml-1 text-right">
                {Math.trunc(poolInfo.maxDepositAmount * 100000) / 100000}
              </span>
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AmountInput;
