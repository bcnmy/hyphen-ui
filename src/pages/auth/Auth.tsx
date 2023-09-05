import { useEffect } from "react";

import { useNavigate } from "react-router-dom";
import PrimaryButtonLight from "components/Buttons/PrimaryButtonLight";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export interface IAuthProps {}

export function Auth(props: IAuthProps) {
    const { isConnected: isLoggedIn } = useAccount();
    const { openConnectModal } = useConnectModal();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/");
        } else {
            openConnectModal && openConnectModal();
        }
    }, [isLoggedIn, navigate, openConnectModal]);

    return (
        <main className="h-full w-full flex flex-col">
            {/* <Navbar /> */}
            <div className="flex flex-grow items-center justify-center mb-24">
                <div className="max-w-xl m-4 p-10 flex flex-col items-center gap-8 border border-white border-opacity-30 rounded-lg bg-white bg-opacity-3">
                    <h1 className="text-lg font-medium">
                        Login with your wallet to access your rewards
                    </h1>
                    <PrimaryButtonLight onClick={openConnectModal}>
                        Login
                    </PrimaryButtonLight>
                </div>
            </div>
        </main>
    );
}

