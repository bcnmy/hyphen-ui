import { useTransaction } from "context/Transaction";
import * as React from "react";
import { FaInfoCircle } from "react-icons/fa";
import { Status } from "hooks/useLoading";
import { Transition } from "react-transition-group";
import { twMerge } from "tailwind-merge";
import Skeleton from "react-loading-skeleton";
import { useToken } from "context/Token";

interface ITransactionFeeProps {}

const TransactionFee: React.FunctionComponent<ITransactionFeeProps> = (
  props
) => {
  const {
    transactionFee,
    fetchTransactionFeeStatus,
    transactionAmountValidationErrors,
  } = useTransaction()!;
  const { selectedToken } = useToken()!;

  return (
    <Transition
      in={
        (fetchTransactionFeeStatus === Status.PENDING ||
          fetchTransactionFeeStatus === Status.SUCCESS) &&
        transactionAmountValidationErrors.length === 0
      }
      timeout={300}
    >
      {(state) => (
        <div
          className={twMerge(
            "transition-transform transform-gpu",
            (state === "exiting" || state === "exited") && "-translate-y-full"
          )}
        >
          <div className="relative z-0 mx-10 bg-white border-b shadow-lg bg-opacity-10 backdrop-blur border-white/10 border-x rounded-b-md">
            <div className="absolute opacity-80 -inset-[2px] bg-gradient-to-br from-white/10 to-hyphen-purple/30 blur-md -z-10"></div>
            <div className="grid grid-cols-2 p-6 text-sm text-white/75 gap-y-2">
              <span className="flex items-center gap-2 font-medium">
                <FaInfoCircle /> Liquidity Provider Fee
              </span>
              <span className="font-mono text-right">
                {fetchTransactionFeeStatus === Status.SUCCESS &&
                transactionFee ? (
                  <>{`${transactionFee.lpFeeProcessedString} ${selectedToken?.symbol}`}</>
                ) : (
                  <Skeleton
                    baseColor="#ffffff10"
                    highlightColor="#ffffff15"
                    className="max-w-[80px]"
                  />
                )}
              </span>
              <span className="flex items-center gap-2 font-medium">
                <FaInfoCircle />
                Transaction Fee
              </span>
              <span className="font-mono text-right">
                {fetchTransactionFeeStatus === Status.SUCCESS &&
                transactionFee ? (
                  <>{`${transactionFee.transactionFeeProcessedString} ${selectedToken?.symbol}`}</>
                ) : (
                  <Skeleton
                    baseColor="#ffffff10"
                    highlightColor="#ffffff15"
                    className="max-w-[80px]"
                  />
                )}
              </span>
              <span className="flex items-center gap-2 font-medium">
                <FaInfoCircle />
                You get minimum
              </span>
              <span className="font-mono text-right">
                {fetchTransactionFeeStatus === Status.SUCCESS &&
                transactionFee ? (
                  <>{`${transactionFee.amountToGetProcessedString} ${selectedToken?.symbol}`}</>
                ) : (
                  <Skeleton
                    baseColor="#ffffff10"
                    highlightColor="#ffffff15"
                    className="max-w-[80px]"
                  />
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </Transition>
  );
};

export default TransactionFee;
