import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { HiExclamation, HiInformationCircle } from 'react-icons/hi';
import { Transition } from 'react-transition-group';
import { twMerge } from 'tailwind-merge';
import { useChains } from 'context/Chains';
import { useToken } from 'context/Token';
import { useTransaction } from 'context/Transaction';
import { Status } from 'hooks/useLoading';
import isToChainEthereum from 'utils/isToChainEthereum';
import CustomTooltip from '../../../components/CustomTooltip';

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
      {state => (
        <div
          className={twMerge(
            'transform-gpu transition-transform',
            (state === 'exiting' || state === 'exited') && '-translate-y-full',
          )}
        >
          <div className="mx-10 rounded-b-lg border-x border-b border-white/10 bg-white bg-opacity-10">
            <div className="flex flex-col gap-y-2 p-4 text-sm text-white/75">
              {showEthereumDisclaimer ? (
                <article className="mb-2 flex items-start rounded-xl bg-red-100 p-2 text-sm text-red-600">
                  <HiExclamation className="mr-2 h-6 w-auto" />
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
                    <CustomTooltip id="lpFee">
                      <span>
                        {transactionFee.transferFee}% fee to be given to
                        liquidity providers
                      </span>
                    </CustomTooltip>
                  ) : null}
                  Liquidity Provider Fee
                </div>
                <div className="text-right font-mono">
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

              {transactionFee && transactionFee.rewardAmountString ? (
                <article className="flex items-center justify-between font-medium">
                  <div className="flex items-center">
                    <HiInformationCircle
                      data-tip
                      data-for="lpFee"
                      className="mr-2"
                    />
                    <CustomTooltip id="lpFee">
                      <span>
                        Reward amount for filling up the pool close to supplied
                        liquidity
                      </span>
                    </CustomTooltip>
                    Reward Amount
                  </div>
                  <div className="text-right font-mono">
                    {fetchTransactionFeeStatus === Status.SUCCESS &&
                    transactionFee ? (
                      <>{`${transactionFee.rewardAmountString} ${selectedToken?.symbol}`}</>
                    ) : (
                      <Skeleton
                        baseColor="#ffffff10"
                        highlightColor="#ffffff15"
                        className="max-w-[80px]"
                      />
                    )}
                  </div>
                </article>
              ) : null}
              <article className="flex items-center justify-between font-medium">
                <div className="flex items-center">
                  <HiInformationCircle
                    data-tip
                    data-for="transactionFee"
                    className="mr-2"
                  />
                  {toChain ? (
                    <CustomTooltip id="transactionFee">
                      <span>
                        Fee corresponding to the transaction done by Biconomy to
                        transfer funds on {toChain.name}. It varies as per the
                        market gas price on {toChain.name}.
                      </span>
                    </CustomTooltip>
                  ) : null}
                  Transaction Fee
                </div>
                <div className="text-right font-mono">
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
                    <CustomTooltip id="minimumFunds">
                      <span>
                        Minimum funds you will get on {toChain.name}. Actual
                        amount may vary slightly based on on-chain data.
                      </span>
                    </CustomTooltip>
                  ) : null}
                  You get minimum
                </div>
                <div className="text-right font-mono">
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
