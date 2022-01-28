import React, { useEffect } from "react";

import { useWalletProvider } from "../../context/WalletProvider";
import { useNavigate } from "react-router-dom";
import { useChains } from "../../context/Chains";

import NetworkSelectors from "./components/NetworkSelectors";
import TokenSelector from "./components/TokenSelector";
import AmountInput from "./components/AmountInput";
import Navbar from "components/Navbar";
import Footer from "components/Footer";
import TransactionFee from "./components/TransactionFee";
import ChangeReceiverAddress from "./components/ChangeReceiverAddress";
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
import { FaInfoCircle } from "react-icons/fa";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const { areChainsReady } = useChains()!;
  const { changeTransferAmountInputValue } = useTransaction()!;
  const { isBiconomyAllowed, setIsBiconomyToggledOn, isBiconomyEnabled } =
    useBiconomy()!;
  const navigate = useNavigate();
  const { isLoggedIn, connect } = useWalletProvider()!;
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
      <div className="flex flex-col items-stretch gap-4 mt-14">
        <div className="flex flex-grow">
          <div className="flex flex-col flex-grow max-w-xl mx-auto">
            <div className="relative z-10 flex-grow">
              <div className="flex flex-col flex-grow min-w-0 gap-2 p-6 bg-white shadow-lg rounded-3xl">
                <div className="flex items-center justify-end mb-2">
                  <div
                    data-tip
                    data-for="whyGaslessDisabled"
                    className={twMerge(
                      "flex items-center",
                      !isBiconomyAllowed && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span className="mr-2 text-base font-semibold text-hyphen-purple-dark/80">
                      Toggle Gasless
                    </span>
                    <Toggle
                      label="Toggle Gasless"
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
                <div className="grid grid-cols-[1fr_34px_1fr] items-center gap-2 p-4 rounded-xl bg-hyphen-purple bg-opacity-[0.05] border-hyphen-purple border border-opacity-10 hover:border-opacity-30">
                  <AmountInput disabled={!areChainsReady} />
                  <div></div>
                  <TokenSelector disabled={!areChainsReady} />
                </div>

                <ChangeReceiverAddress />

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
      <Footer />
    </div>
  );
};

export default Home;
