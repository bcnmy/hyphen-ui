import React, { useEffect, useState } from 'react';
import * as HyphenWidget from 'hyphen-widget-test';
import 'hyphen-widget-test/dist/index.css';
import config from 'config';
import { useWalletProvider } from 'context/WalletProvider';

interface BridgeProps {}

const Bridge: React.FC<BridgeProps> = () => {
  const [, setHyphenWidget] = useState();
  const { isLoggedIn, connect } = useWalletProvider()!;

  useEffect(() => {
    (async () => {
      await connect().catch((e: Error) => {
        console.error(e);
      });
    })();
  }, [isLoggedIn, connect]);

  useEffect(() => {
    const widgetContainer = document.getElementById('hyphen-widget');

    if (widgetContainer) {
      const widget = HyphenWidget.default.init(widgetContainer, {
        tag: config.constants.DEPOSIT_TAG,
        env: process.env.REACT_APP_ENV,
        showWidget: true,
        showGasTokenSwap: true,
      });

      if (widget) {
        setHyphenWidget(widget);
      }
    }
  }, []);

  return (
    <div className="bg-cover bg-top bg-no-repeat py-12.5 xl:bg-bridge">
      <div className="mx-auto w-full px-6 md:max-w-xl md:px-0">
        <button
          onClick={async () => {
            // const wallet = await getWallet();
            // console.log(wallet);
            // wallet.showConnectModal();
            // wallet.showWallet();
            // if (!isLoggedIn)
            // socialConnect();
          }}
          style={{
            backgroundColor: 'aliceblue',
            marginBottom: 30,
            padding: 10,
            marginRight: 20,
          }}
        >
          Biconomy Social Login
        </button>

        <button
          onClick={async () => {
            // const wallet = await getWallet();
            // console.log(wallet);
            // wallet.showConnectModal();
            // wallet.showWallet();
            // if (isLoggedIn)
            // socialDisconnect();
          }}
          style={{
            backgroundColor: 'aliceblue',
            marginBottom: 30,
            padding: 10,
          }}
        >
          Biconomy Social Logout
        </button>

        <div id="hyphen-widget"></div>
      </div>
    </div>
  );
};

export default Bridge;
