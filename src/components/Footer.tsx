import { useWalletProvider } from 'context/WalletProvider';
import { useLocation } from 'react-router-dom';
import poweredByBiconomy from '../assets/images/powered-by-biconomy.svg';
import NetworkSelector from './NetworkSelector';

import discordLogoLight from '../assets/images/discord-logo-light.svg';
import emailLogoLight from '../assets/images/email-logo-light.svg';

interface IFooterProps {
  showUserInfoModal: () => void;
}

function Footer({ showUserInfoModal }: IFooterProps) {
  const location = useLocation();
  const { accounts, connect, isLoggedIn } = useWalletProvider()!;
  const userAddress = accounts?.[0];

  const showNetworkSelector = [
    '/pools',
    '/pools/',
    '/farms',
    '/farms/',
  ].includes(location.pathname);

  return (
    <footer className="sticky bottom-0 z-20 grid h-auto w-full grid-cols-1 items-center bg-black px-0 xl:grid-cols-3 xl:px-6">
      <div className="col-span-2 grid h-12 grid-cols-2 items-center px-6 xl:h-auto xl:px-0">
        <a
          target="_blank"
          href="https://biconomy.io/"
          rel="noreferrer"
          className="justify-self-start"
        >
          <img src={poweredByBiconomy} alt="Powered by Biconomy" />
        </a>
        <div className="flex justify-self-end xl:justify-self-center">
          <a
            href="https://discord.com/channels/692403655474937856/947490096075141150"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white"
          >
            <span className="hidden text-[#808080] xl:flex">
              Join our Discord
            </span>
            <img
              src={discordLogoLight}
              alt="Join our Discord"
              className="mr-2.5 flex xl:hidden"
            />
          </a>
          <p className="mx-2 hidden text-[#808080] xl:flex">|</p>
          <a
            href="mailto:hyphen-support@biconomy.io"
            className="hover:text-white"
          >
            <span className="hidden text-[#808080] xl:flex">Email Us</span>
            <img
              src={emailLogoLight}
              alt="Email Us"
              className="flex xl:hidden"
            />
          </a>
        </div>
      </div>
      <div
        className={`${
          showNetworkSelector ? 'justify-between' : 'justify-end'
        } flex h-[3.5rem] w-full items-center bg-[#2e2c62] px-6 xl:hidden`}
      >
        {showNetworkSelector ? <NetworkSelector /> : null}
        <button
          className={`${
            showNetworkSelector ? 'ml-2.5' : 'w-full'
          } font-base cursor-pointer rounded-xl bg-hyphen-purple bg-opacity-50 px-4 py-1 font-mono text-white`}
          onClick={isLoggedIn ? showUserInfoModal : connect}
        >
          {isLoggedIn
            ? `${userAddress?.slice(0, 6)}...${userAddress?.slice(-6)}`
            : 'Connect Wallet'}
        </button>
      </div>
    </footer>
  );
}

export default Footer;
