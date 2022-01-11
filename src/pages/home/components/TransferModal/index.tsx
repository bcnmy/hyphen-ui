import PrimaryButtonLight from "components/Buttons/PrimaryButtonLight";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { formatDistanceStrict } from "date-fns";
import { FaInfoCircle } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { twMerge } from "tailwind-merge";
import Skeleton from "react-loading-skeleton";

import { Dialog, Transition } from "@headlessui/react";
import Modal from "components/Modal";
import { useTokenApproval } from "context/TokenApproval";
import { useTransaction } from "context/Transaction";
import { Transition as TransitionReact } from "react-transition-group";
import { Status } from "hooks/useLoading";
import SecondaryButtonLight from "components/Buttons/SecondaryButtonLight";
import { PrimaryButtonDark } from "components/Buttons/PrimaryButtonDark";
import Spinner from "components/Buttons/Spinner";
import AnimateHeight from "react-animate-height";
import { ethers } from "ethers";
import { useWalletProvider } from "context/WalletProvider";
import { useChains } from "context/Chains";
import { useToken } from "context/Token";
import { useHyphen } from "context/Hyphen";
import { HiOutlineExternalLink } from "react-icons/hi";
import SpinnerDark from "components/Buttons/SpinnerDark";
import ReactTooltip from "react-tooltip";
import {
  ITransferRecord,
  useTransactionInfoModal,
} from "context/TransactionInfoModal";

export interface ITransferModalProps {
  isVisible: boolean;
  onClose: () => void;
}

interface Step {
  currentStepNumber: number;
  stepNumber: number;
  onNextStep: () => void;
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
      <div className="text-hyphen-purple-darker/70 font-medium py-2 flex items-center gap-4">
        <div className="bg-hyphen-purple/30 border border-hyphen-purple-dark/10 shadow-sm p-3 rounded-full text-hyphen-purple-darker/80 relative">
          <span className="absolute inset-0 text-center flex items-center justify-center text-xs">
            <span className="mb-0.5">{stepNumber}</span>
          </span>
        </div>
        <span>Checking Available Liquidity</span>
      </div>
      <AnimateHeight height={active ? "auto" : 0}>
        <div className="transition-colors p-4 rounded-xl bg-hyphen-purple bg-opacity-[0.05] border-hyphen-purple border border-opacity-10 hover:border-opacity-30 mx-10 mt-2">
          <div className="text-sm text-hyphen-purple-dark/60 font-medium text-center">
            {executePreDepositCheckError ? (
              <span className="text-red-700/70 font-semibold">
                {executePreDepositCheckError.toString()}
              </span>
            ) : (
              <div className="flex items-center gap-4 justify-center">
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

  const [executed, setExecuted] = useState(false);

  useEffect(() => {
    if (active) {
      executeDeposit();
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
        console.log("dep");
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
      <div className="text-hyphen-purple-darker/70 font-medium py-2 flex items-center gap-4">
        <div className="bg-hyphen-purple/30 border border-hyphen-purple-dark/10 shadow-sm p-3 rounded-full text-hyphen-purple-darker/80 relative">
          <span className="absolute inset-0 text-center flex items-center justify-center text-xs">
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
            <span className="text-red-700/70 font-medium text-sm">
              {executeDepositError?.message || executeDepositError.toString()}
            </span>
          ) : (
            <div className="text-sm text-hyphen-purple-dark/60 font-medium text-center flex items-center gap-4 justify-center">
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
    setReceivalState: (state: Status) => void;
  }
> = ({ currentStepNumber, stepNumber, setReceivalState, onNextStep }) => {
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
            setExitHash(hash);
            setExecuted(true);
          }
          if (tries > 300) {
            clearInterval(keepChecking);
            throw new Error("exhauseted max retries");
          }
        } catch (e) {
          setReceivalError(e);
        }
      }, 1000);
    }
  }, [active, checkReceival, exitHash, setExitHash]);

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
      <div className="text-hyphen-purple-darker/70 font-medium py-2 flex items-center gap-4">
        <div className="bg-hyphen-purple/30 border border-hyphen-purple-dark/10 shadow-sm p-3 rounded-full text-hyphen-purple-darker/80 relative">
          <span className="absolute inset-0 text-center flex items-center justify-center text-xs">
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
            <span className="text-red-700/70 font-medium">
              {receivalError?.message || receivalError.toString()}
            </span>
          ) : (
            <div className="text-sm text-hyphen-purple-dark/60 font-medium text-center flex items-center gap-4 justify-center">
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
  const { selectedToken } = useToken()!;
  const { transferAmount, executeDepositValue, exitHash, transactionFee } =
    useTransaction()!;
  const { fromChain, toChain } = useChains()!;
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

  return (
    <Modal
      isVisible={isVisible}
      onClose={() => {
        console.log(isExitAllowed);
        isExitAllowed && onClose();
      }}
    >
      <div className="mb-14">
        <div className="bg-white p-6 rounded-3xl shadow-lg relative z-20 border-hyphen-purple-darker/50 border">
          <div className="absolute -inset-2 bg-white/60 opacity-50 rounded-3xl blur-lg -z-10"></div>
          <div className="flex flex-col">
            <div className="flex items-center mb-6">
              <Dialog.Title
                as="h1"
                className="font-semibold text-xl text-black text-opacity-[0.54] p-2"
              >
                Transfer Activity
              </Dialog.Title>
              <div className="text-hyphen-purple-dark/80 ml-auto hover">
                <span data-tip data-for="whyModalExitDisabled">
                  <button
                    onClick={() => {
                      console.log(isExitAllowed);
                      isExitAllowed && onClose();
                    }}
                    disabled={!isExitAllowed}
                  >
                    <IoMdClose className="h-6 w-auto" />
                  </button>
                </span>
                {!isExitAllowed && (
                  <ReactTooltip
                    id="whyModalExitDisabled"
                    type="dark"
                    effect="solid"
                  >
                    <span>
                      Exit is disabled because transfer is in progress
                    </span>
                  </ReactTooltip>
                )}
              </div>
            </div>
            <div className="pl-2 flex flex-col gap-2">
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
                stepNumber={3}
                onNextStep={nextStep}
                setReceivalState={setReceivalState}
              />
            </div>
            <div className="mt-4 pt-3 pb-2 flex justify-center">
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
              <div className="mx-10 relative">
                <div className="absolute opacity-80 -inset-[2px] bg-gradient-to-br from-white/10 to-hyphen-purple/30 blur-md -z-10"></div>
                <div className="bg-gradient-to-r from-hyphen-purple-darker via-hyphen-purple-mid to-hyphen-purple-darker backdrop-blur border-white/20 border-x border-b rounded-b-md relative shadow-lg z-0">
                  <div
                    className="grid text-white/75 p-6 gap-y-2"
                    style={{ gridTemplateColumns: "1fr auto" }}
                  >
                    <span className="font-normal flex items-center gap-3">
                      <FaInfoCircle /> Deposit on {fromChain?.name}
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
                    <span className="font-normal flex items-center gap-3">
                      <FaInfoCircle />
                      Transfer on {toChain?.name}
                    </span>
                    <span className="text-right">
                      {receivalState === Status.PENDING ||
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
