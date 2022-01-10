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
          <div className="bg-white mx-10 bg-opacity-10 backdrop-blur border-white/10 border-x border-b rounded-b-md relative shadow-lg z-0">
            <div className="absolute opacity-80 -inset-[2px] bg-gradient-to-br from-white/10 to-hyphen-purple/30 blur-md -z-10"></div>
            <div className="grid grid-cols-2 text-white/75 p-6 gap-y-2 text-sm">
              <span className="font-medium flex items-center gap-2">
                <FaInfoCircle /> Liquidity Provider Fee
              </span>
              <span className="text-right font-mono">
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
              <span className="font-medium flex items-center gap-2">
                <FaInfoCircle />
                Transaction Fee
              </span>
              <span className="text-right font-mono">
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
              <span className="font-medium flex items-center gap-2">
                <FaInfoCircle />
                You get minimum
              </span>
              <span className="text-right font-mono">
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
