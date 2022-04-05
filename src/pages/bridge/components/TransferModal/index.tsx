import PrimaryButtonLight from 'components/Buttons/PrimaryButtonLight';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { formatDistanceStrict } from 'date-fns';
import { IoMdClose } from 'react-icons/io';
import { twMerge } from 'tailwind-merge';
import Skeleton from 'react-loading-skeleton';

import { Dialog } from '@headlessui/react';
import Modal from 'components/Modal';
import { useTransaction } from 'context/Transaction';
import { Transition as TransitionReact } from 'react-transition-group';
import { Status } from 'hooks/useLoading';
import { PrimaryButtonDark } from 'components/Buttons/PrimaryButtonDark';
import Spinner from 'components/Buttons/Spinner';
import AnimateHeight from 'react-animate-height';
import { useChains } from 'context/Chains';
import { useToken } from 'context/Token';
import { HiExclamation, HiOutlineArrowSmRight } from 'react-icons/hi';
import SpinnerDark from 'components/Buttons/SpinnerDark';
import {
  ITransferRecord,
  useTransactionInfoModal,
} from 'context/TransactionInfoModal';
import CustomTooltip from '../../../../components/CustomTooltip';
// import { MANUAL_EXIT_RETRIES } from "../../../../config/constants";

export interface ITransferModalProps {
  isVisible: boolean;
  onClose: () => void;
  transferModalData: any;
}

interface Step {
  currentStepNumber: number;
  onNextStep: () => void;
  stepNumber: number;
  transferModalData: any;
}

const PreDepositStep: React.FC<
  Step & { setModalErrored: (modalErrored: boolean) => void }
> = ({
  currentStepNumber,
  stepNumber,
  onNextStep,
  setModalErrored,
  transferModalData,
}) => {
  const active = currentStepNumber === stepNumber;
  const completed = currentStepNumber > stepNumber;

  // we set this to true after this step is executed
  // this is done so that stale values of value and error are not used
  const [executed, setExecuted] = useState(false);
  const { toChain } = transferModalData;

  const {
    executePreDepositCheck,
    executePreDepositCheckError,
    executePreDepositCheckStatus,
  } = useTransaction()!;

  useEffect(() => {
    if (active) {
      executePreDepositCheck();
      setExecuted(true);
    }
  }, [active, executePreDepositCheck]);

  useEffect(() => {
    if (executed && executePreDepositCheckError && active)
      setModalErrored(true);
  }, [executed, executePreDepositCheckError, active, setModalErrored]);

  useEffect(() => {
    if (executed && executePreDepositCheckStatus === Status.SUCCESS && active) {
      onNextStep();
      setExecuted(false);
    }
  }, [executed, executePreDepositCheckStatus, onNextStep, active]);

  return (
    <div className={!active && !completed ? 'opacity-30' : ''}>
      <div className="flex items-center gap-4 py-2 font-medium text-hyphen-purple-darker/70">
        <div className="relative rounded-full border border-hyphen-purple-dark/10 bg-hyphen-purple/30 p-3 text-hyphen-purple-darker/80 shadow-sm">
          <span className="absolute inset-0 flex items-center justify-center text-center text-xs">
            <span className="mb-0.5">{stepNumber}</span>
          </span>
        </div>
        <span>Checking Available Liquidity</span>
      </div>
      <AnimateHeight height={active ? 'auto' : 0}>
        <div className="mx-10 mt-2 rounded-xl border border-hyphen-purple border-opacity-10 bg-hyphen-purple bg-opacity-[0.05] p-4 transition-colors hover:border-opacity-30">
          <div className="text-center text-sm font-medium text-hyphen-purple-dark/60">
            {executePreDepositCheckError ? (
              <span className="font-semibold text-red-700/70">
                {executePreDepositCheckError.toString()}
              </span>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <Spinner />
                <span> Checking Available liquidity on {toChain?.name}</span>
              </div>
            )}
          </div>
        </div>
      </AnimateHeight>
    </div>
  );
};

const DepositStep: React.FC<
  Step & {
    setDepositState: (state: Status) => void;
    setModalErrored: (modalErrored: boolean) => void;
  }
> = ({
  currentStepNumber,
  stepNumber,
  setDepositState,
  onNextStep,
  setModalErrored,
  transferModalData,
}) => {
  const active = currentStepNumber === stepNumber;
  const completed = currentStepNumber > stepNumber;
  const {
    executeDeposit,
    executeDepositStatus,
    executeDepositValue,
    executeDepositError,
  } = useTransaction()!;
  const { fromChain, selectedToken, transferAmount } = transferModalData;
  const {
    receiver: { receiverAddress },
  } = useTransaction()!;

  const [executed, setExecuted] = useState(false);

  useEffect(() => {
    if (active) {
      executeDeposit(receiverAddress);
      setExecuted(true);
    }
  }, [active, executeDeposit, receiverAddress]);

  useEffect(() => {
    if (executed && executeDepositError && active) setModalErrored(true);
  }, [executed, executeDepositError, setModalErrored, active]);

  useEffect(() => {
    if (executed && executeDepositStatus === Status.SUCCESS) {
      setDepositState(Status.PENDING);
      setExecuted(false);
      (async () => {
        await executeDepositValue.wait(1);
        setDepositState(Status.SUCCESS);
        onNextStep();
      })();
    }
  }, [
    executed,
    executeDepositStatus,
    onNextStep,
    setDepositState,
    executeDepositValue,
  ]);

  return (
    <div className={!active && !completed ? 'opacity-30' : ''}>
      <div className="flex items-center gap-4 py-2 font-medium text-hyphen-purple-darker/70">
        <div className="relative rounded-full border border-hyphen-purple-dark/10 bg-hyphen-purple/30 p-3 text-hyphen-purple-darker/80 shadow-sm">
          <span className="absolute inset-0 flex items-center justify-center text-center text-xs">
            <span className="mb-0.5">{stepNumber}</span>
          </span>
        </div>
        <span>
          Deposit {transferAmount} {selectedToken?.symbol} on {fromChain?.name}
        </span>
      </div>
      <AnimateHeight height={active ? 'auto' : 0}>
        <div className="mx-10 mt-2 rounded-xl border border-hyphen-purple border-opacity-10 bg-hyphen-purple bg-opacity-[0.05] p-4 transition-colors hover:border-opacity-30">
          {executeDepositError ? (
            <span className="text-sm font-medium text-red-700/70">
              {executeDepositError?.message || executeDepositError.toString()}
            </span>
          ) : (
            <div className="flex items-center justify-center gap-4 text-center text-sm font-medium text-hyphen-purple-dark/60">
              <Spinner />
              <div>
                {executeDepositStatus === Status.PENDING &&
                  'Confirm the deposit transaction in your wallet'}
                {executeDepositStatus === Status.SUCCESS &&
                  `Waiting for deposit confirmation on ${fromChain?.name}`}
              </div>
            </div>
          )}
        </div>
      </AnimateHeight>
    </div>
  );
};

const ReceivalStep: React.FC<
  Step & {
    // hideManualExit: () => void;
    setModalErrored: (modalErrored: boolean) => void;
    refreshSelectedTokenBalance: () => void;
    setReceivalState: (state: Status) => void;
    // showManualExit: () => void;
  }
> = ({
  currentStepNumber,
  // hideManualExit,
  setModalErrored,
  onNextStep,
  refreshSelectedTokenBalance,
  setReceivalState,
  // showManualExit,
  stepNumber,
  transferModalData,
}) => {
  const active = currentStepNumber === stepNumber;
  const completed = currentStepNumber > stepNumber;

  const { checkReceival, exitHash, setExitHash } = useTransaction()!;
  const { selectedToken, toChainRpcUrlProvider, toChain, transactionFee } =
    transferModalData;

  const [receivalError, setReceivalError] = useState<any>();
  const [executed, setExecuted] = useState(false);

  useEffect(() => {
    if (active) {
      let tries = 0;
      let keepChecking = setInterval(async () => {
        try {
          tries++;
          let hash = await checkReceival();
          if (hash) {
            clearInterval(keepChecking);
            // hideManualExit();
            refreshSelectedTokenBalance();
            setExitHash(hash);
            setExecuted(true);
          }
          // else if (tries > MANUAL_EXIT_RETRIES) {
          //   showManualExit();
          // }
          else if (tries > 300) {
            clearInterval(keepChecking);
            throw new Error('exhauseted max retries');
          }
        } catch (e) {
          setReceivalError(e);
          setModalErrored(true);
        }
      }, 5000);
    }
    // Note: Remember to update the dependency array if adding manual exit.
  }, [
    active,
    checkReceival,
    refreshSelectedTokenBalance,
    setExitHash,
    setModalErrored,
  ]);

  useEffect(() => {
    try {
      if (!toChainRpcUrlProvider) {
        console.error(
          'We were not able to fetch the details, please refresh and try again later.',
        );
        setReceivalError(
          'We were not able to fetch the details, please refresh and try again later.',
        );
        throw new Error(
          'We were not able to fetch the details, please refresh and try again later.',
        );
      } else if (exitHash && executed && active) {
        setReceivalState(Status.PENDING);
        (async () => {
          let tx = await toChainRpcUrlProvider.getTransaction(exitHash);
          setExecuted(false);
          await tx?.wait(1);
          setReceivalState(Status.SUCCESS);
          onNextStep();
        })();
      }
    } catch (e) {
      setReceivalError(e);
      setModalErrored(true);
    }
  }, [
    active,
    executed,
    exitHash,
    onNextStep,
    setModalErrored,
    setReceivalState,
    toChainRpcUrlProvider,
  ]);

  return (
    <div className={!active && !completed ? 'opacity-30' : ''}>
      <div className="flex items-center gap-4 py-2 font-medium text-hyphen-purple-darker/70">
        <div className="relative rounded-full border border-hyphen-purple-dark/10 bg-hyphen-purple/30 p-3 text-hyphen-purple-darker/80 shadow-sm">
          <span className="absolute inset-0 flex items-center justify-center text-center text-xs">
            <span className="mb-0.5">{stepNumber}</span>
          </span>
        </div>
        <span>
          Get ~{transactionFee?.amountToGetProcessedString}{' '}
          {selectedToken?.symbol} on {toChain?.name}
        </span>
      </div>
      <AnimateHeight height={active ? 'auto' : 0}>
        <div className="mx-10 mt-2 rounded-xl border border-hyphen-purple border-opacity-10 bg-hyphen-purple bg-opacity-[0.05] p-4 transition-colors hover:border-opacity-30">
          {receivalError ? (
            <span className="font-medium text-red-700/70">
              {receivalError?.message || receivalError.toString()}
            </span>
          ) : (
            <div className="flex items-center justify-center gap-4 text-center text-sm font-medium text-hyphen-purple-dark/60">
              <Spinner />
              Waiting to receive ~{
                transactionFee?.amountToGetProcessedString
              }{' '}
              {selectedToken?.symbol} on {toChain?.name}
            </div>
          )}
        </div>
      </AnimateHeight>
    </div>
  );
};

export const TransferModal: React.FC<ITransferModalProps> = ({
  isVisible,
  onClose,
  transferModalData,
}) => {
  const { fromChain, selectedToken, toChain, transferAmount, transactionFee } =
    transferModalData;

  const { refreshSelectedTokenBalance } = useToken()!;
  const { executeDepositValue, exitHash } = useTransaction()!;
  // const { hyphen } = useHyphen()!;
  const { showTransactionInfoModal } = useTransactionInfoModal()!;
  const [modalErrored, setModalErrored] = useState(false);

  useEffect(() => {
    console.log({ modalErrored });
  }, [modalErrored]);

  const [depositState, setDepositState] = useState<Status>(Status.IDLE);
  const [receivalState, setReceivalState] = useState<Status>(Status.IDLE);
  const [startTime, setStartTime] = useState<Date>();
  const [endTime, setEndTime] = useState<Date>();
  const [activeStep, setActiveStep] = useState(0);
  // const [canManualExit, setCanManualExit] = useState(false);
  // const [isManualExitDisabled, setIsManualExitDisabled] = useState(false);
  const nextStep = useCallback(
    () => setActiveStep(i => i + 1),
    [setActiveStep],
  );

  useEffect(() => {
    if (activeStep === 3) {
      setStartTime(new Date());
    } else if (activeStep === 4) {
      setEndTime(new Date());
    }
  }, [activeStep]);

  const isBottomTrayOpen = useMemo(() => {
    return (
      depositState === Status.PENDING ||
      depositState === Status.SUCCESS ||
      receivalState === Status.PENDING ||
      receivalState === Status.SUCCESS
    );
  }, [depositState, receivalState]);

  useEffect(() => {
    if (isVisible) setActiveStep(1);
    else {
      setActiveStep(0);
      setDepositState(Status.IDLE);
      setReceivalState(Status.IDLE);
      setModalErrored(false);
      setStartTime(undefined);
      setEndTime(undefined);
    }
  }, [isVisible]);

  const isExitAllowed = useMemo(() => {
    if (activeStep === 2 || activeStep === 3) {
      if (modalErrored) {
        return true;
      }
    } else {
      return true;
    }
    return false;
  }, [activeStep, modalErrored]);

  const openTransferInfoModal = useCallback(() => {
    if (
      !transferAmount ||
      !exitHash ||
      !fromChain ||
      !toChain ||
      !selectedToken ||
      !transactionFee ||
      !endTime ||
      !startTime
    ) {
      return;
    }

    let transferRecord: ITransferRecord = {
      depositHash: executeDepositValue.hash,
      depositAmount: transferAmount.toString(),
      exitHash: exitHash,
      token: selectedToken,
      fromChain,
      toChain,
      lpFee: transactionFee.lpFeeProcessedString,
      rewardAmount: transactionFee.rewardAmountString,
      transferredAmount: transactionFee.amountToGetProcessedString,
      transactionFee: transactionFee.transactionFeeProcessedString,
      transferTime: formatDistanceStrict(endTime, startTime),
    };

    showTransactionInfoModal(transferRecord);
  }, [
    executeDepositValue?.hash,
    exitHash,
    fromChain,
    selectedToken,
    toChain,
    transactionFee,
    transferAmount,
    showTransactionInfoModal,
    startTime,
    endTime,
  ]);

  // const showManualExit = useCallback(() => {
  //   setCanManualExit(true);
  // }, []);

  // const hideManualExit = useCallback(() => {
  //   setCanManualExit(false);
  // }, []);

  // const disableManualExit = () => {
  //   setIsManualExitDisabled(true);
  // };

  // async function triggerManualExit() {
  //   try {
  //     console.log(
  //       `Triggering manual exit for deposit hash ${executeDepositValue.hash} and chainId ${fromChain?.chainId}...`
  //     );
  //     disableManualExit();
  //     const response = await hyphen.triggerManualTransfer(
  //       executeDepositValue.hash,
  //       fromChain?.chainId
  //     );
  //     if (response && response.exitHash) {
  //       hideManualExit();
  //       setReceivalState(Status.PENDING);
  //     }
  //   } catch (e) {
  //     console.error("Failed to execute manual transfer: ", e);
  //   }
  // }

  return (
    <Modal isVisible={isVisible} onClose={() => {}}>
      <div className="mb-14">
        <div className="relative z-20 rounded-3xl border border-hyphen-purple-darker/50 bg-white p-6 shadow-lg">
          <div className="absolute -inset-2 -z-10 rounded-3xl bg-white/60 opacity-50 blur-lg"></div>
          <div className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title
                as="h1"
                className="text-xl font-semibold text-gray-700"
              >
                Transfer Activity
              </Dialog.Title>
              <span data-tip data-for="whyModalExitDisabled">
                <button
                  className="rounded hover:bg-gray-100"
                  onClick={() => {
                    isExitAllowed && onClose();
                  }}
                  disabled={!isExitAllowed}
                >
                  <IoMdClose className="h-6 w-auto text-gray-500" />
                </button>
              </span>
              {!isExitAllowed && (
                <CustomTooltip id="whyModalExitDisabled">
                  <span>Exit is disabled because transfer is in progress</span>
                </CustomTooltip>
              )}
            </div>
            <div className="flex flex-col gap-2 pl-2">
              <PreDepositStep
                currentStepNumber={activeStep}
                stepNumber={1}
                onNextStep={nextStep}
                setModalErrored={setModalErrored}
                transferModalData={transferModalData}
              />
              <DepositStep
                currentStepNumber={activeStep}
                stepNumber={2}
                onNextStep={nextStep}
                setModalErrored={setModalErrored}
                setDepositState={setDepositState}
                transferModalData={transferModalData}
              />
              <ReceivalStep
                currentStepNumber={activeStep}
                // hideManualExit={hideManualExit}
                setModalErrored={setModalErrored}
                onNextStep={nextStep}
                refreshSelectedTokenBalance={refreshSelectedTokenBalance}
                setReceivalState={setReceivalState}
                // showManualExit={showManualExit}
                stepNumber={3}
                transferModalData={transferModalData}
              />
            </div>
            <div className="mt-4 flex justify-center pt-3 pb-2">
              {modalErrored ? (
                <PrimaryButtonLight
                  className="px-8"
                  onClick={() => {
                    onClose();
                  }}
                >
                  <span>Close</span>
                </PrimaryButtonLight>
              ) : (
                <PrimaryButtonLight
                  className="px-8"
                  disabled={receivalState !== Status.SUCCESS}
                  onClick={() => {
                    openTransferInfoModal();
                  }}
                >
                  <div className="flex items-center gap-3">
                    {receivalState !== Status.SUCCESS ? (
                      <>
                        {/* <Spinner /> */}
                        <span>Transfer in Progress </span>
                      </>
                    ) : (
                      <>
                        <span>View Details</span>
                      </>
                    )}
                  </div>
                </PrimaryButtonLight>
              )}
            </div>
          </div>
        </div>

        <TransitionReact in={isBottomTrayOpen} timeout={300}>
          {state => (
            <div
              className={twMerge(
                'transform-gpu transition-transform',
                (state === 'exiting' || state === 'exited') &&
                  '-translate-y-full',
              )}
            >
              <div className="relative mx-10">
                <div className="absolute -inset-[2px] -z-10 bg-gradient-to-br from-white/10 to-hyphen-purple/30 opacity-80 blur-md"></div>
                <div className="relative z-0 rounded-b-md border-x border-b border-white/20 bg-gradient-to-r from-hyphen-purple-darker via-hyphen-purple-mid to-hyphen-purple-darker p-4 shadow-lg backdrop-blur">
                  <article className="mb-4 flex items-start rounded-xl bg-red-100 p-2 text-sm text-red-600">
                    <HiExclamation className="mr-2 h-6 w-auto" />
                    <p>
                      Please do not refresh or change network while the
                      transaction is in progress.
                    </p>
                  </article>
                  <div
                    className="grid gap-y-2 text-white/75"
                    style={{ gridTemplateColumns: '1fr auto' }}
                  >
                    <span className="flex items-center gap-3 font-normal">
                      Deposit on {fromChain?.name}
                    </span>
                    <span className="text-right">
                      {depositState === Status.PENDING ||
                      depositState === Status.SUCCESS ? (
                        <PrimaryButtonDark
                          className="px-6"
                          onClick={() => {
                            window.open(
                              `${fromChain?.explorerUrl}/tx/${executeDepositValue.hash}`,
                              '_blank',
                            );
                          }}
                        >
                          {depositState === Status.PENDING && (
                            <div className="flex items-center gap-3">
                              <SpinnerDark />
                              <span className="flex items-center gap-2">
                                <span>Pending</span>
                                <span>
                                  <HiOutlineArrowSmRight className="h-5 w-5 -rotate-45" />
                                </span>
                              </span>
                            </div>
                          )}
                          {depositState === Status.SUCCESS && (
                            <div className="flex items-center gap-2">
                              <span>Confirmed</span>
                              <span>
                                <HiOutlineArrowSmRight className="h-5 w-5 -rotate-45" />
                              </span>
                            </div>
                          )}
                        </PrimaryButtonDark>
                      ) : (
                        <Skeleton
                          baseColor="#ffffff10"
                          highlightColor="#ffffff15"
                          className="my-4 mr-2 max-w-[100px]"
                        />
                      )}
                    </span>
                    <span className="flex items-center gap-3 font-normal">
                      Transfer on {toChain?.name}
                      {/* {canManualExit
                        ? "Transfer taking time?"
                        : `Transfer on ${toChain?.name}`} */}
                    </span>
                    <span className="text-right">
                      {
                        // canManualExit ? (
                        //   <PrimaryButtonDark
                        //     className="px-6"
                        //     onClick={triggerManualExit}
                        //     disabled={isManualExitDisabled}
                        //   >
                        //     Click here
                        //   </PrimaryButtonDark>
                        // ) :
                        receivalState === Status.PENDING ||
                        receivalState === Status.SUCCESS ? (
                          <PrimaryButtonDark
                            className="px-6"
                            onClick={() => {
                              window.open(
                                `${toChain?.explorerUrl}/tx/${exitHash}`,
                                '_blank',
                              );
                            }}
                          >
                            {receivalState === Status.PENDING && (
                              <div className="flex items-center gap-3">
                                <SpinnerDark />
                                <span className="flex items-center gap-2">
                                  <span>Pending</span>
                                  <span>
                                    <HiOutlineArrowSmRight className="h-5 w-5 -rotate-45" />
                                  </span>
                                </span>
                              </div>
                            )}
                            {receivalState === Status.SUCCESS && (
                              <div className="flex items-center gap-2">
                                <span>Confirmed</span>
                                <span>
                                  <HiOutlineArrowSmRight className="h-5 w-5 -rotate-45" />
                                </span>
                              </div>
                            )}
                          </PrimaryButtonDark>
                        ) : (
                          <Skeleton
                            baseColor="#ffffff10"
                            highlightColor="#ffffff15"
                            className="my-4 mr-2 max-w-[100px]"
                          />
                        )
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TransitionReact>
      </div>
    </Modal>
  );
};

export default TransferModal;
