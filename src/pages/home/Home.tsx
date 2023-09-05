import React from "react";

import { useChains } from "../../context/Chains";

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
import CustomTooltip from "./components/CustomTooltip";
import { HiInformationCircle } from "react-icons/hi";
import NetworkSelectors from "./components/NetworkSelectors";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
    const { areChainsReady } = useChains()!;
    const { changeTransferAmountInputValue } = useTransaction()!;
    const { isBiconomyAllowed, setIsBiconomyToggledOn, isBiconomyEnabled } =
        useBiconomy()!;
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
    const { isVisible: isUserInfoModalVisible, hideModal: hideUserInfoModal } =
        useModal();
    const { executeApproveTokenError } = useTokenApproval()!;

    return (
        <div className="grid grid-rows-[4rem_1fr_3rem] w-full min-h-screen">
            <Navbar />
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
            <ErrorModal
                error={executeApproveTokenError}
                title={"Approval Error"}
            />
            <div className="my-14">
                <div className="max-w-xl mx-auto">
                    <div className="relative z-10">
                        <div className="flex flex-col gap-2 p-6 bg-white shadow-lg rounded-3xl">
                            <div className="flex items-center justify-end mb-2">
                                <div className="flex items-center">
                                    <HiInformationCircle
                                        data-tip
                                        data-for="gaslessMode"
                                        className="mr-2 text-gray-500"
                                    />
                                    <CustomTooltip
                                        id="gaslessMode"
                                        text="This transaction is sponsored by Biconomy"
                                    />
                                    <div
                                        className={
                                            !isBiconomyAllowed
                                                ? "flex opacity-50 cursor-not-allowed"
                                                : "flex"
                                        }
                                        data-tip
                                        data-for="whyGaslessDisabled"
                                    >
                                        <span className="mr-2 text-base font-semibold text-gray-500">
                                            Gasless Mode
                                        </span>
                                        <Toggle
                                            label="Gasless Mode"
                                            enabled={isBiconomyEnabled}
                                            onToggle={(enabled) =>
                                                setIsBiconomyToggledOn(enabled)
                                            }
                                        />
                                    </div>
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
            <Footer />
        </div>
    );
};

export default Home;

