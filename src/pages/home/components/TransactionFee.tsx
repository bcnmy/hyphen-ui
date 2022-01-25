import { useTransaction } from "context/Transaction";
import * as React from "react";
import { Status } from "hooks/useLoading";
import { Transition } from "react-transition-group";
import { twMerge } from "tailwind-merge";
import Skeleton from "react-loading-skeleton";
import { useToken } from "context/Token";
import { HiInformationCircle } from "react-icons/hi";
import CustomTooltip from "./CustomTooltip";
import { useChains } from "context/Chains";

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
  const { toChain } = useChains()!;

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
          <div className="mx-10 bg-white border-b bg-opacity-10 border-white/10 border-x rounded-b-md">
            <div className="grid grid-cols-2 p-6 text-sm text-white/75 gap-y-2">
              <div className="flex items-center gap-2 font-medium">
                <HiInformationCircle data-tip data-for="lpFee" />
                {transactionFee ? (
                  <CustomTooltip
                    id="lpFee"
                    text={`${transactionFee.lpFeeProcessedString}% fee to be given to liquidity providers`}
                  />
                ) : null}
                Liquidity Provider Fee
              </div>
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
                <HiInformationCircle data-tip data-for="transactionFee" />
                {toChain ? (
                  <CustomTooltip
                    id="transactionFee"
                    text={`Fee corresponding to the transaction done by Biconomy to transfer funds on ${toChain.name}. It varies as per the market gas price on ${toChain.name}.`}
                  />
                ) : null}
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
                <HiInformationCircle data-tip data-for="minimumFunds" />
                {toChain ? (
                  <CustomTooltip
                    id="minimumFunds"
                    text={`Minimum funds you will get on ${toChain.name}. Actual amount may vary slightly based on on-chain data.`}
                  />
                ) : null}
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
