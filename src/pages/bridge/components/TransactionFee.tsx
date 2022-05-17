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
    transferAmountInputValue,
    transactionFee,
    fetchTransactionFeeStatus,
  } = useTransaction()!;
  const { selectedToken } = useToken()!;
  const { toChain } = useChains()!;
  const showEthereumDisclaimer = toChain
    ? isToChainEthereum(toChain.chainId)
    : false;

  const totalFee = transactionFee
    ? Number.parseFloat(transactionFee.lpFeeProcessedString) +
      Number.parseFloat(transactionFee.transactionFeeProcessedString) -
      Number.parseFloat(transactionFee.rewardAmountString || '0')
    : undefined;

  return (
    <Transition
      in={
        (fetchTransactionFeeStatus === Status.PENDING ||
          fetchTransactionFeeStatus === Status.SUCCESS) &&
        transferAmountInputValue !== ''
      }
      timeout={300}
    >
      {state => (
        <div
          className={twMerge(
            'invisible transition-opacity',
            state === 'entering' && 'visible opacity-100',
            state === 'entered' && 'visible opacity-100',
            state === 'exiting' && 'visible opacity-0',
            state === 'exited' && 'invisible opacity-0',
          )}
        >
          <div className="mt-2.5 rounded-10 border-x border-b border-white/10 bg-hyphen-purple bg-opacity-25">
            <div className="flex flex-col gap-y-2 p-7.5 text-xxxs uppercase text-white/75 xl:p-12.5 xl:text-xxs">
              {showEthereumDisclaimer ? (
                <article className="mb-2 flex items-center rounded-2.5 bg-red-100 p-4 text-xxxs uppercase text-red-600 xl:text-xxs">
                  <HiExclamation className="mr-2 h-4 w-auto" />
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
                      <div>
                        <span>
                          LP fee ({transactionFee.transferFeePercentage}%):{' '}
                        </span>
                        {fetchTransactionFeeStatus === Status.SUCCESS &&
                        transactionFee ? (
                          <>{`${transactionFee.lpFeeProcessedString} ${selectedToken?.symbol}`}</>
                        ) : (
                          <Skeleton
                            baseColor="#ffffff10"
                            enableAnimation
                            highlightColor="#615ccd05"
                            className="!w-12"
                          />
                        )}
                      </div>
                      {transactionFee && transactionFee.rewardAmountString ? (
                        <div>
                          <span>Reward amount: </span>
                          {fetchTransactionFeeStatus === Status.SUCCESS &&
                          transactionFee ? (
                            <>{`${transactionFee.rewardAmountString} ${selectedToken?.symbol}`}</>
                          ) : (
                            <Skeleton
                              baseColor="#ffffff10"
                              enableAnimation
                              highlightColor="#615ccd05"
                              className="!w-12"
                            />
                          )}
                        </div>
                      ) : null}
                      <div>
                        <span>Transaction fee: </span>
                        {fetchTransactionFeeStatus === Status.SUCCESS &&
                        transactionFee ? (
                          <>{`${transactionFee.transactionFeeProcessedString} ${selectedToken?.symbol}`}</>
                        ) : (
                          <Skeleton
                            baseColor="#ffffff10"
                            enableAnimation
                            highlightColor="#615ccd05"
                            className="!w-12"
                          />
                        )}
                      </div>
                    </CustomTooltip>
                  ) : null}
                  Total fee
                </div>
                <div className="text-right font-mono">
                  {fetchTransactionFeeStatus === Status.SUCCESS &&
                  transactionFee ? (
                    <>{`${totalFee?.toFixed(3)} ${selectedToken?.symbol}`}</>
                  ) : (
                    <Skeleton
                      baseColor="#ffffff10"
                      enableAnimation
                      highlightColor="#615ccd05"
                      className="!w-32"
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
                      enableAnimation
                      highlightColor="#615ccd05"
                      className="!w-32"
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
