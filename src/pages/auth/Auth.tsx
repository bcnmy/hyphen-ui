import React, { useEffect, useState } from "react";
import { useWalletProvider } from "../../context/WalletProvider";

import { useNavigate } from "react-router-dom";
import PrimaryButtonLight from "components/Buttons/PrimaryButtonLight";
// import InfoBox from "../../components/InfoBox";
// import { Navbar } from "../../components/Navbar";

export interface IAuthProps {}

export function Auth(props: IAuthProps) {
  const { isLoggedIn, connect } = useWalletProvider()!;
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    } else {
      (async () => {
        await connect().catch((e) => {
          console.error(e);
          setLoginError(
            "The login process could not be completed. Please try again."
          );
        });
      })();
    }
  }, [isLoggedIn, navigate, connect]);

  return (
    <main className="h-full w-full flex flex-col">
      {/* <Navbar /> */}
      <div className="flex flex-grow items-center justify-center mb-24">
        <div className="max-w-xl m-4 p-10 flex flex-col items-center gap-8 border border-white border-opacity-30 rounded-lg bg-white bg-opacity-3">
          <h1 className="text-lg font-medium">
            Login with your wallet to access your rewards
          </h1>
          <PrimaryButtonLight
            onClick={async () => {
              await connect().catch((e) => {
                console.error(e);
                setLoginError(
                  "The login process could not be completed. Please try again."
                );
              });
              // let wallectSelectedOkay = await onboard?.walletSelect();
              // if (wallectSelectedOkay) {
              //   let walletOkay = await onboard?.walletCheck();
              //   if (walletOkay) {
              //     console.log("something happened");
              //     navigate("/");
              //   } else {
              //     setLoginError(
              //       "Your wallet could not be connected. Please try again."
              //     );
              //   }
              // } else {
              //   setLoginError(
              //     "Login popup closed before completion."
              //   );
              // }
            }}
          >
            Login
          </PrimaryButtonLight>
          {/* {loginError && loginError.length > 0 && (
            <InfoBox variant="error" value={loginError} className="text-sm" />
          )} */}
        </div>
      </div>
    </main>
  );
}
