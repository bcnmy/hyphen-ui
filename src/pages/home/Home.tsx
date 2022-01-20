import React, { useEffect } from "react";

import { useWalletProvider } from "../../context/WalletProvider";
import { useNavigate } from "react-router-dom";
import { useChains } from "../../context/Chains";

import NetworkSelectors from "./components/NetworkSelectors";
import { useToken } from "context/Token";
import TokenSelector from "./components/TokenSelector";
import AmountInput from "./components/AmountInput";
import Navbar from "components/Navbar";
import TransactionFee from "./components/TransactionFee";
import CallToAction from "./components/CallToAction";
import { Toggle } from "components/Toggle";
import useModal from "hooks/useModal";
import ApprovalModal from "./components/ApprovalModal";
import { useTokenApproval } from "context/TokenApproval";
import ErrorModal from "./components/ErrorModal";
import TransferModal from "./components/TransferModal";
import UserInfoModal from "./components/UserInfoModal";
import { useTransaction } from "context/Transaction";
import { useBiconomy } from "context/Biconomy";
import { twMerge } from "tailwind-merge";
import CustomTooltip from "./components/CustomTooltip";
import isToChainEthereum from "utils/isToChainEthereum";
import { FaInfoCircle } from "react-icons/fa";
import { HiExclamation } from "react-icons/hi";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const { areChainsReady, toChain } = useChains()!;
  const { changeTransferAmountInputValue } = useTransaction()!;
  const { selectedTokenBalance } = useToken()!;

  const {
    isBiconomyAllowed,
    isBiconomyToggledOn,
    setIsBiconomyToggledOn,
    isBiconomyEnabled,
  } = useBiconomy()!;

  const navigate = useNavigate();
  const { isLoggedIn, connect } = useWalletProvider()!;
  const showEthereumDisclaimer = toChain
    ? isToChainEthereum(toChain.chainId)
    : false;

  const {
    isVisible: isApprovalModalVisible,
    hideModal: hideApprovalModal,
    showModal: showApprovalModal,
  } = useModal();

  const {
    isVisible: isTransferModalVisible,
    hideModal: hideTransferlModal,
    showModal: showTransferModal,
  } = useModal();

  const {
    isVisible: isUserInfoModalVisible,
    hideModal: hideUserInfoModal,
    showModal: showUserInfoModal,
  } = useModal();

  const { executeApproveTokenError } = useTokenApproval()!;

  useEffect(() => {
    (async () => {
      await connect().catch((e) => {
        console.error(e);
      });
    })();
  }, [isLoggedIn, navigate, connect]);

  return (
    <div className="flex flex-col w-full h-full">
      <Navbar showUserInfoModal={showUserInfoModal} />
      <ApprovalModal
        isVisible={isApprovalModalVisible}
        onClose={hideApprovalModal}
      />
      <TransferModal
        isVisible={isTransferModalVisible}
        onClose={() => {
          changeTransferAmountInputValue("");
          hideTransferlModal();
        }}
      />
      <UserInfoModal
        isVisible={isUserInfoModalVisible}
        onClose={hideUserInfoModal}
      />
      <ErrorModal error={executeApproveTokenError} title={"Approval Error"} />
      <div className="flex flex-col items-stretch gap-4">
        <span className="flex items-center gap-2 mx-auto mt-8">
          <span className="flex-shrink-0 text-xs font-bold text-white">
            Powered By
          </span>
          <img
            src={`${process.env.PUBLIC_URL}/biconomy-wordmark.svg`}
            className="h-10"
            alt="Biconomy Logo"
          />
        </span>

        <div className="flex flex-grow">
          <div className="flex flex-col flex-grow max-w-xl mx-auto">
            <div className="relative z-10 flex-grow">
              <div className="absolute opacity-80 inset-2 rounded-3xl bg-hyphen-purple/75 blur-lg -z-10"></div>
              <div className="flex flex-col flex-grow min-w-0 gap-2 p-6 mx-4 mt-4 bg-white shadow-lg rounded-3xl">
                <div className="flex items-center justify-between">
                  <img
                    src={`${process.env.PUBLIC_URL}/hyphen-logo.svg`}
                    className="h-8 m-2 opacity-100"
                    alt="Hyphen Logo"
                  />

                  <div
                    data-tip
                    data-for="whyGaslessDisabled"
                    className={twMerge(
                      "p-1 flex gap-4 items-center",
                      !isBiconomyAllowed && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold uppercase text-hyphen-purple-dark/80">
                      <FaInfoCircle />
                      <span className="mt-0.5">Go Gasless</span>
                    </span>
                    <Toggle
                      label="Go Gasless:"
                      enabled={isBiconomyEnabled}
                      onToggle={(enabled) => setIsBiconomyToggledOn(enabled)}
                    />
                  </div>
                  {!isBiconomyAllowed && (
                    <CustomTooltip
                      id="whyGaslessDisabled"
                      text="Disabled for selected chain"
                    />
                  )}
                </div>
                <div className="grid grid-cols-[1fr_34px_1fr] gap-2 p-4 rounded-xl bg-hyphen-purple bg-opacity-[0.05] border-hyphen-purple border border-opacity-10 hover:border-opacity-30">
                  <NetworkSelectors />
                </div>
                <div className="grid grid-cols-[244px_1fr] gap-3 p-4 rounded-xl bg-hyphen-purple bg-opacity-[0.05] border-hyphen-purple border border-opacity-10 hover:border-opacity-30">
                  <AmountInput disabled={!areChainsReady} />
                  <TokenSelector disabled={!areChainsReady} />
                </div>
                {showEthereumDisclaimer ? (
                  <article className="flex items-start p-4 text-sm text-red-600 bg-red-100 rounded-xl">
                    <HiExclamation className="w-auto h-6 mr-2" />
                    <p>
                      The received amount may differ due to gas price
                      fluctuations on Ethereum.
                    </p>
                  </article>
                ) : null}
                <CallToAction
                  onApproveButtonClick={showApprovalModal}
                  onTransferButtonClick={showTransferModal}
                />
              </div>
            </div>
            <TransactionFee />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
