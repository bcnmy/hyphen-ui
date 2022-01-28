import PrimaryButtonLight from "components/Buttons/PrimaryButtonLight";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceStrict } from "date-fns";
import { IoMdClose } from "react-icons/io";
import { twMerge } from "tailwind-merge";
import Skeleton from "react-loading-skeleton";

import { Dialog } from "@headlessui/react";
import Modal from "components/Modal";
import { useTransaction } from "context/Transaction";
import { Transition as TransitionReact } from "react-transition-group";
import { Status } from "hooks/useLoading";
import { PrimaryButtonDark } from "components/Buttons/PrimaryButtonDark";
import Spinner from "components/Buttons/Spinner";
import AnimateHeight from "react-animate-height";
import { useChains } from "context/Chains";
import { useHyphen } from "context/Hyphen";
import { useToken } from "context/Token";
import { HiOutlineExternalLink } from "react-icons/hi";
import SpinnerDark from "components/Buttons/SpinnerDark";
import {
  ITransferRecord,
  useTransactionInfoModal,
} from "context/TransactionInfoModal";
import CustomTooltip from "../CustomTooltip";
import { MANUAL_EXIT_RETRIES } from "../../../../config/constants";

export interface ITransferModalProps {
  isVisible: boolean;
  onClose: () => void;
}

interface Step {
  currentStepNumber: number;
  onNextStep: () => void;
  stepNumber: number;
}

const PreDepositStep: React.FC<Step & { onError: () => void }> = ({
  currentStepNumber,
  stepNumber,
  onNextStep,
  onError,
}) => {
  const active = currentStepNumber === stepNumber;
  const completed = currentStepNumber > stepNumber;

  // we set this to true after this step is executed
  // this is done so that stale values of value and error are not used
  const [executed, setExecuted] = useState(false);
  const { toChain } = useChains()!;

  const {
    executePreDepositCheck,
    executePreDepositCheckError,
    executePreDepositCheckValue,
    executePreDepositCheckStatus,
  } = useTransaction()!;

  useEffect(() => {
    if (active) {
      executePreDepositCheck();
      setExecuted(true);
    }
  }, [active, executePreDepositCheck]);

  useEffect(() => {
    if (executed && executePreDepositCheckError && active) onError();
  }, [executed, executePreDepositCheckError, onError, active]);

  useEffect(() => {
    if (executed && executePreDepositCheckStatus === Status.SUCCESS && active) {
      onNextStep();
      setExecuted(false);
    }
  }, [executed, executePreDepositCheckStatus, onNextStep, active]);

  return (
    <div className={!active && !completed ? "opacity-30" : ""}>
      <div className="flex items-center gap-4 py-2 font-medium text-hyphen-purple-darker/70">
        <div className="relative p-3 border rounded-full shadow-sm bg-hyphen-purple/30 border-hyphen-purple-dark/10 text-hyphen-purple-darker/80">
          <span className="absolute inset-0 flex items-center justify-center text-xs text-center">
            <span className="mb-0.5">{stepNumber}</span>
          </span>
        </div>
        <span>Checking Available Liquidity</span>
      </div>
      <AnimateHeight height={active ? "auto" : 0}>
        <div className="transition-colors p-4 rounded-xl bg-hyphen-purple bg-opacity-[0.05] border-hyphen-purple border border-opacity-10 hover:border-opacity-30 mx-10 mt-2">
          <div className="text-sm font-medium text-center text-hyphen-purple-dark/60">
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
    onError: () => void;
  }
> = ({
  currentStepNumber,
  stepNumber,
  setDepositState,
  onNextStep,
  onError,
}) => {
  const active = currentStepNumber === stepNumber;
  const completed = currentStepNumber > stepNumber;
  const {
    transferAmount,
    executeDeposit,
    executeDepositStatus,
    executeDepositValue,
    executeDepositError,
  } = useTransaction()!;
  const { selectedToken } = useToken()!;
  const { toChainRpcUrlProvider, fromChain } = useChains()!;
  const {
    receiver: { receiverAddress },
  } = useTransaction()!;

  const [executed, setExecuted] = useState(false);

  useEffect(() => {
    if (active) {
      executeDeposit(receiverAddress);
      setExecuted(true);
    }
  }, [active, executeDeposit]);

  useEffect(() => {
    if (executed && executeDepositError && active) onError();
  }, [executed, executeDepositError, onError, active]);

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
    <div className={!active && !completed ? "opacity-30" : ""}>
      <div className="flex items-center gap-4 py-2 font-medium text-hyphen-purple-darker/70">
        <div className="relative p-3 border rounded-full shadow-sm bg-hyphen-purple/30 border-hyphen-purple-dark/10 text-hyphen-purple-darker/80">
          <span className="absolute inset-0 flex items-center justify-center text-xs text-center">
            <span className="mb-0.5">{stepNumber}</span>
          </span>
        </div>
        <span>
          Deposit {transferAmount} {selectedToken?.symbol} on {fromChain?.name}
        </span>
      </div>
      <AnimateHeight height={active ? "auto" : 0}>
        <div className="transition-colors p-4 rounded-xl bg-hyphen-purple bg-opacity-[0.05] border-hyphen-purple border border-opacity-10 hover:border-opacity-30 mx-10 mt-2">
          {executeDepositError ? (
            <span className="text-sm font-medium text-red-700/70">
              {executeDepositError?.message || executeDepositError.toString()}
            </span>
          ) : (
            <div className="flex items-center justify-center gap-4 text-sm font-medium text-center text-hyphen-purple-dark/60">
              <Spinner />
              <div>
                {executeDepositStatus === Status.PENDING &&
                  "Confirm the deposit transaction in your wallet"}
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
    hideManualExit: () => void;
    refreshSelectedTokenBalance: () => void;
    setReceivalState: (state: Status) => void;
    showManualExit: () => void;
  }
> = ({
  currentStepNumber,
  hideManualExit,
  onNextStep,
  refreshSelectedTokenBalance,
  setReceivalState,
  showManualExit,
  stepNumber,
}) => {
  const active = currentStepNumber === stepNumber;
  const completed = currentStepNumber > stepNumber;

  const { selectedToken } = useToken()!;
  const { checkReceival, exitHash, setExitHash, transactionFee } =
    useTransaction()!;
  const { toChainRpcUrlProvider, toChain } = useChains()!;

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
            hideManualExit();
            refreshSelectedTokenBalance();
            setExitHash(hash);
            setExecuted(true);
          } else if (tries > MANUAL_EXIT_RETRIES) {
            showManualExit();
          } else if (tries > 300) {
            clearInterval(keepChecking);
            throw new Error("exhauseted max retries");
          }
        } catch (e) {
          setReceivalError(e);
        }
      }, 1000);
    }
  }, [active, checkReceival, hideManualExit, setExitHash, showManualExit]);

  useEffect(() => {
    if (!toChainRpcUrlProvider) {
      console.error("Something has gone horribly wrong");
      setReceivalError("Unrecoverable application error. Contact us.");
      throw new Error("Something has gone horribly wrong");
    }
    if (exitHash && executed && active) {
      setReceivalState(Status.PENDING);
      (async () => {
        let tx = await toChainRpcUrlProvider.getTransaction(exitHash);
        setExecuted(false);
        await tx?.wait(1);
        setReceivalState(Status.SUCCESS);
        onNextStep();
      })();
    }
  }, [
    active,
    executed,
    exitHash,
    onNextStep,
    setReceivalState,
    toChainRpcUrlProvider,
  ]);

  return (
    <div className={!active && !completed ? "opacity-30" : ""}>
      <div className="flex items-center gap-4 py-2 font-medium text-hyphen-purple-darker/70">
        <div className="relative p-3 border rounded-full shadow-sm bg-hyphen-purple/30 border-hyphen-purple-dark/10 text-hyphen-purple-darker/80">
          <span className="absolute inset-0 flex items-center justify-center text-xs text-center">
            <span className="mb-0.5">{stepNumber}</span>
          </span>
        </div>
        <span>
          Get ~{transactionFee?.amountToGetProcessedString}{" "}
          {selectedToken?.symbol} on {toChain?.name}
        </span>
      </div>
      <AnimateHeight height={active ? "auto" : 0}>
        <div className="transition-colors p-4 rounded-xl bg-hyphen-purple bg-opacity-[0.05] border-hyphen-purple border border-opacity-10 hover:border-opacity-30 mx-10 mt-2">
          {receivalError ? (
            <span className="font-medium text-red-700/70">
              {receivalError?.message || receivalError.toString()}
            </span>
          ) : (
            <div className="flex items-center justify-center gap-4 text-sm font-medium text-center text-hyphen-purple-dark/60">
              <Spinner />
              Waiting to receive ~{
                transactionFee?.amountToGetProcessedString
              }{" "}
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
}) => {
  const { refreshSelectedTokenBalance, selectedToken } = useToken()!;
  const { transferAmount, executeDepositValue, exitHash, transactionFee } =
    useTransaction()!;
  const { fromChain, toChain } = useChains()!;
  const { hyphen } = useHyphen()!;
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
  const [canManualExit, setCanManualExit] = useState(false);
  const nextStep = useCallback(
    () => setActiveStep((i) => i + 1),
    [setActiveStep]
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
    )
      return;

    let transferRecord: ITransferRecord = {
      depositHash: executeDepositValue.hash,
      depositAmount: transferAmount.toString(),
      exitHash: exitHash,
      token: selectedToken,
      fromChain,
      toChain,
      lpFee: transactionFee.lpFeeProcessedString,
      transactionFee: transactionFee.transactionFeeProcessedString,
      transferTime: formatDistanceStrict(endTime, startTime),
    };

    showTransactionInfoModal(transferRecord);
    onClose();
  }, [
    executeDepositValue?.hash,
    exitHash,
    fromChain,
    selectedToken,
    toChain,
    transactionFee,
    transferAmount,
    showTransactionInfoModal,
    onClose,
    startTime,
    endTime,
  ]);

  const showManualExit = useCallback(() => {
    setCanManualExit(true);
  }, []);

  const hideManualExit = useCallback(() => {
    setCanManualExit(false);
  }, []);

  async function triggerManualExit() {
    try {
      console.log(
        `Triggering manual exit for deposit hash ${executeDepositValue.hash} and chainId ${fromChain?.chainId}...`
      );
      const response = await hyphen.triggerManualTransfer(
        executeDepositValue.hash,
        fromChain?.chainId
      );
      if (response && response.exitHash) {
        hideManualExit();
        setReceivalState(Status.PENDING);
      }
    } catch (e) {
      console.error("Failed to execute manual transfer: ", e);
    }
  }

  return (
    <Modal
      isVisible={isVisible}
      onClose={() => {
        isExitAllowed && onClose();
      }}
    >
      <div className="mb-14">
        <div className="relative z-20 p-6 bg-white border shadow-lg rounded-3xl border-hyphen-purple-darker/50">
          <div className="absolute opacity-50 -inset-2 bg-white/60 rounded-3xl blur-lg -z-10"></div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
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
                  <IoMdClose className="w-auto h-6 text-gray-500" />
                </button>
              </span>
              {!isExitAllowed && (
                <CustomTooltip
                  id="whyModalExitDisabled"
                  text="Exit is disabled because transfer is in progress"
                />
              )}
            </div>
            <div className="flex flex-col gap-2 pl-2">
              <PreDepositStep
                currentStepNumber={activeStep}
                stepNumber={1}
                onNextStep={nextStep}
                onError={() => setModalErrored(true)}
              />
              <DepositStep
                currentStepNumber={activeStep}
                stepNumber={2}
                onNextStep={nextStep}
                onError={() => setModalErrored(true)}
                setDepositState={setDepositState}
              />
              <ReceivalStep
                currentStepNumber={activeStep}
                hideManualExit={hideManualExit}
                onNextStep={nextStep}
                refreshSelectedTokenBalance={refreshSelectedTokenBalance}
                setReceivalState={setReceivalState}
                showManualExit={showManualExit}
                stepNumber={3}
              />
            </div>
            <div className="flex justify-center pt-3 pb-2 mt-4">
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
          {(state) => (
            <div
              className={twMerge(
                "transition-transform transform-gpu",
                (state === "exiting" || state === "exited") &&
                  "-translate-y-full"
              )}
            >
              <div className="relative mx-10">
                <div className="absolute opacity-80 -inset-[2px] bg-gradient-to-br from-white/10 to-hyphen-purple/30 blur-md -z-10"></div>
                <div className="relative z-0 border-b shadow-lg bg-gradient-to-r from-hyphen-purple-darker via-hyphen-purple-mid to-hyphen-purple-darker backdrop-blur border-white/20 border-x rounded-b-md">
                  <div
                    className="grid p-6 text-white/75 gap-y-2"
                    style={{ gridTemplateColumns: "1fr auto" }}
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
                              "_blank"
                            );
                          }}
                        >
                          {depositState === Status.PENDING && (
                            <div className="flex items-center gap-3">
                              <SpinnerDark />
                              <span className="flex items-center gap-2">
                                <span>Pending</span>
                                <span>
                                  <HiOutlineExternalLink />
                                </span>
                              </span>
                            </div>
                          )}
                          {depositState === Status.SUCCESS && (
                            <div className="flex items-center gap-2">
                              <span>Confirmed</span>
                              <span>
                                <HiOutlineExternalLink />
                              </span>
                            </div>
                          )}
                        </PrimaryButtonDark>
                      ) : (
                        <Skeleton
                          baseColor="#ffffff10"
                          highlightColor="#ffffff15"
                          className="max-w-[100px] my-4 mr-2"
                        />
                      )}
                    </span>
                    <span className="flex items-center gap-3 font-normal">
                      {canManualExit
                        ? "Transfer taking time?"
                        : `Transfer on ${toChain?.name}`}
                    </span>
                    <span className="text-right">
                      {canManualExit ? (
                        <PrimaryButtonDark
                          className="px-6"
                          onClick={triggerManualExit}
                        >
                          Click here
                        </PrimaryButtonDark>
                      ) : receivalState === Status.PENDING ||
                        receivalState === Status.SUCCESS ? (
                        <PrimaryButtonDark
                          className="px-6"
                          onClick={() => {
                            window.open(
                              `${toChain?.explorerUrl}/tx/${exitHash}`,
                              "_blank"
                            );
                          }}
                        >
                          {receivalState === Status.PENDING && (
                            <div className="flex items-center gap-3">
                              <SpinnerDark />
                              <span className="flex items-center gap-2">
                                <span>Pending</span>
                                <span>
                                  <HiOutlineExternalLink />
                                </span>
                              </span>
                            </div>
                          )}
                          {receivalState === Status.SUCCESS && (
                            <div className="flex items-center gap-2">
                              <span>Confirmed</span>
                              <span>
                                <HiOutlineExternalLink />
                              </span>
                            </div>
                          )}
                        </PrimaryButtonDark>
                      ) : (
                        <Skeleton
                          baseColor="#ffffff10"
                          highlightColor="#ffffff15"
                          className="max-w-[100px] my-4 mr-2"
                        />
                      )}
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
