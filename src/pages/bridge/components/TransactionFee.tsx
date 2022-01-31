import React from "react";
import Skeleton from "react-loading-skeleton";
import { HiExclamation, HiInformationCircle } from "react-icons/hi";
import { Transition } from "react-transition-group";
import { twMerge } from "tailwind-merge";
import { useChains } from "context/Chains";
import { useToken } from "context/Token";
import { useTransaction } from "context/Transaction";
import { Status } from "hooks/useLoading";
import isToChainEthereum from "utils/isToChainEthereum";
import CustomTooltip from "./CustomTooltip";

interface ITransactionFeeProps {}

const TransactionFee: React.FunctionComponent<ITransactionFeeProps> = () => {
  const {
    transactionFee,
    fetchTransactionFeeStatus,
    transactionAmountValidationErrors,
  } = useTransaction()!;
  const { selectedToken } = useToken()!;
  const { toChain } = useChains()!;
  const showEthereumDisclaimer = toChain
    ? isToChainEthereum(toChain.chainId)
    : false;

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
          <div className="mx-10 bg-white border-b rounded-b-lg bg-opacity-10 border-white/10 border-x">
            <div className="flex flex-col p-4 text-sm text-white/75 gap-y-2">
              {showEthereumDisclaimer ? (
                <article className="flex items-start p-2 mb-2 text-sm text-red-600 bg-red-100 rounded-xl">
                  <HiExclamation className="w-auto h-6 mr-2" />
                  <p>
                    The received amount may differ due to gas price fluctuations
                    on Ethereum.
                  </p>
                </article>
              ) : null}
              <article className="flex items-center justify-between font-medium">
                <div className="flex items-center">
                  <HiInformationCircle
                    data-tip
                    data-for="lpFee"
                    className="mr-2"
                  />
                  {transactionFee ? (
                    <CustomTooltip
                      id="lpFee"
                      text={`${transactionFee.lpFeeProcessedString}% fee to be given to liquidity providers`}
                    />
                  ) : null}
                  Liquidity Provider Fee
                </div>
                <div className="font-mono text-right">
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
                </div>
              </article>
              <article className="flex items-center justify-between font-medium">
                <div className="flex items-center">
                  <HiInformationCircle
                    data-tip
                    data-for="transactionFee"
                    className="mr-2"
                  />
                  {toChain ? (
                    <CustomTooltip
                      id="transactionFee"
                      text={`Fee corresponding to the transaction done by Biconomy to transfer funds on ${toChain.name}. It varies as per the market gas price on ${toChain.name}.`}
                    />
                  ) : null}
                  Transaction Fee
                </div>
                <div className="font-mono text-right">
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
                </div>
              </article>
              <article className="flex items-center justify-between font-medium">
                <div className="flex items-center">
                  <HiInformationCircle
                    data-tip
                    data-for="minimumFunds"
                    className="mr-2"
                  />
                  {toChain ? (
                    <CustomTooltip
                      id="minimumFunds"
                      text={`Minimum funds you will get on ${toChain.name}. Actual amount may vary slightly based on on-chain data.`}
                    />
                  ) : null}
                  You get minimum
                </div>
                <div className="font-mono text-right">
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
                </div>
              </article>
            </div>
          </div>
        </div>
      )}
    </Transition>
  );
};

export default TransactionFee;
