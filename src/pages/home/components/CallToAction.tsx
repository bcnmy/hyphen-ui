import PrimaryButtonLight from "components/Buttons/PrimaryButtonLight";
import SecondaryButtonLight from "components/Buttons/SecondaryButtonLight";
import Spinner from "components/Buttons/Spinner";
import { useTokenApproval } from "context/TokenApproval";
import { useTransaction } from "context/Transaction";
import { Status } from "hooks/useLoading";
import * as React from "react";
import CustomTooltip from "./CustomTooltip";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export interface ICallToActionProps {
    onApproveButtonClick: () => void;
    onTransferButtonClick: () => void;
}

export const CallToAction: React.FC<ICallToActionProps> = ({
    onApproveButtonClick,
    onTransferButtonClick,
}) => {
    const {
        executeApproveTokenStatus,
        fetchSelectedTokenApprovalError,
        fetchSelectedTokenApprovalStatus,
        fetchSelectedTokenApprovalValue,
    } = useTokenApproval()!;
    const { isConnected: isLoggedIn } = useAccount();
    const { openConnectModal } = useConnectModal();

    const {
        receiver: { isReceiverValid },
        transactionAmountValidationErrors,
    } = useTransaction()!;

    if (!isLoggedIn) {
        return (
            <div className="flex justify-center gap-8 mt-4">
                <PrimaryButtonLight onClick={openConnectModal}>
                    Connect Wallet
                </PrimaryButtonLight>
            </div>
        );
    }
    if (!isReceiverValid) {
        return (
            <div className="flex justify-center gap-8 mt-4">
                <span data-tip data-for="invalidReceiverAddress">
                    <PrimaryButtonLight disabled>
                        Invalid receiver address
                    </PrimaryButtonLight>
                </span>
                <CustomTooltip
                    id="invalidReceiverAddress"
                    text="This receiver address is not valid, please check the address and try again."
                />
            </div>
        );
    }

    return (
        <div className="flex justify-center gap-8 mt-4">
            {fetchSelectedTokenApprovalStatus === Status.IDLE ||
            transactionAmountValidationErrors.length > 0 ||
            fetchSelectedTokenApprovalError ? (
                <>
                    <span data-tip data-for="whyTransferDisabled">
                        <PrimaryButtonLight disabled>
                            Transfer
                        </PrimaryButtonLight>
                    </span>
                    <CustomTooltip
                        id="whyTransferDisabled"
                        text={
                            fetchSelectedTokenApprovalError &&
                            transactionAmountValidationErrors.length === 0
                                ? "Error trying to fetch token approval"
                                : "Enter a valid transfer amount"
                        }
                    />
                </>
            ) : (
                <>
                    {fetchSelectedTokenApprovalStatus === Status.PENDING && (
                        <>
                            <div
                                data-tip
                                data-for="whyTransferDisabled"
                                className="flex items-center"
                            >
                                {fetchSelectedTokenApprovalValue === false ? (
                                    <SecondaryButtonLight
                                        disabled
                                        className="mr-8"
                                    >
                                        Approve
                                    </SecondaryButtonLight>
                                ) : null}
                                <PrimaryButtonLight
                                    disabled
                                    className="flex items-center gap-2"
                                >
                                    <Spinner />
                                    Transfer
                                </PrimaryButtonLight>
                            </div>
                            <CustomTooltip
                                id="whyTransferDisabled"
                                text="Approval loading"
                            />
                        </>
                    )}
                    {fetchSelectedTokenApprovalStatus === Status.SUCCESS &&
                        fetchSelectedTokenApprovalValue === false && (
                            <>
                                {executeApproveTokenStatus ===
                                Status.PENDING ? (
                                    <SecondaryButtonLight disabled>
                                        <span className="flex items-center gap-2">
                                            <Spinner />
                                            <span>Approve</span>
                                        </span>
                                    </SecondaryButtonLight>
                                ) : (
                                    <SecondaryButtonLight
                                        onClick={onApproveButtonClick}
                                    >
                                        Approve
                                    </SecondaryButtonLight>
                                )}
                                <span data-tip data-for="whyTransferDisabled">
                                    <PrimaryButtonLight disabled>
                                        Transfer
                                    </PrimaryButtonLight>
                                </span>
                                <CustomTooltip
                                    id="whyTransferDisabled"
                                    text="Approve token to enable token transfers"
                                />
                            </>
                        )}

                    {fetchSelectedTokenApprovalStatus === Status.SUCCESS &&
                        fetchSelectedTokenApprovalValue === true && (
                            <PrimaryButtonLight onClick={onTransferButtonClick}>
                                Transfer
                            </PrimaryButtonLight>
                        )}
                </>
            )}
        </div>
    );
};

export default CallToAction;

