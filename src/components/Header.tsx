import { Link, NavLink, useLocation } from 'react-router-dom';
import { useWalletProvider } from 'context/WalletProvider';
import { HiOutlineArrowSmRight } from 'react-icons/hi';
import NetworkSelector from './NetworkSelector';
import { ENV } from 'types/environment';
import SuperHeader from './SuperHeader';

interface IHeaderProps {
  showUserInfoModal: () => void;
}

function Header({ showUserInfoModal }: IHeaderProps) {
  const location = useLocation();
  const { accounts, connect, isLoggedIn } = useWalletProvider()!;
  const userAddress = accounts?.[0];

  const showNetworkSelector = [
    '/pools',
    '/pools/',
    '/farms',
    '/farms/',
  ].includes(location.pathname);

  // Constants for external URLs
  const rewardsUrl = 'https://rewards.biconomy.io/';
  const statsUrl =
    process.env.REACT_APP_ENV === ENV.production
      ? 'https://hyphen-stats.biconomy.io/'
      : 'https://hyphen-stats-staging.biconomy.io/';

  const superHeaderMsg = undefined;

  return (
    <header className="sticky top-0 z-20">
      {superHeaderMsg ? <SuperHeader superHeaderMsg={superHeaderMsg} /> : null}
      <div className="grid h-[3.5rem] w-full grid-cols-[auto_1fr] items-center gap-4 bg-[#2e2c62] px-4 text-white xl:grid-cols-3 xl:px-6">
        <Link to="/bridge">
          <img
            src={`${process.env.PUBLIC_URL}/hyphen-logo.svg`}
            className="hidden min-h-[2rem] w-auto xl:flex"
            alt="Hyphen Logo"
          />
          <img
            src={`${process.env.PUBLIC_URL}/hyphen-logo-small.svg`}
            className="flex min-h-[2rem] w-auto xl:hidden"
            alt="Hyphen Logo"
          />
        </Link>

        <nav className="flex h-full w-full items-center gap-4 justify-self-end overflow-x-auto overflow-y-hidden p-3 text-white md:w-auto md:gap-7 md:overflow-x-hidden xl:justify-self-center">
          <NavLink to="/bridge">
            {({ isActive }) => (
              <span
                className={
                  isActive
                    ? 'relative'
                    : 'relative text-gray-400 hover:text-white'
                }
              >
                Bridge
                <span
                  className={
                    isActive
                      ? 'absolute -inset-1 top-[33px] block h-[5px] rounded-t-full bg-white'
                      : 'hidden'
                  }
                  aria-hidden="true"
                ></span>
              </span>
            )}
          </NavLink>
          <NavLink
            to="/pools"
            className={({ isActive }) => (isActive ? 'relative' : 'relative')}
          >
            {({ isActive }) => (
              <span
                className={
                  isActive
                    ? 'relative'
                    : 'relative whitespace-nowrap text-gray-400 hover:text-white'
                }
              >
                Pools
                <span
                  className={
                    isActive
                      ? 'absolute -inset-1 top-[33px] block h-[5px] rounded-t-full bg-white'
                      : 'hidden'
                  }
                  aria-hidden="true"
                ></span>
              </span>
            )}
          </NavLink>
          <NavLink
            to="/farms"
            className={({ isActive }) => (isActive ? 'relative' : 'relative')}
          >
            {({ isActive }) => (
              <span
                className={
                  isActive
                    ? 'relative'
                    : 'relative whitespace-nowrap text-gray-400 hover:text-white'
                }
              >
                Farms
                <span
                  className={
                    isActive
                      ? 'absolute -inset-1 top-[33px] block h-[5px] rounded-t-full bg-white'
                      : 'hidden'
                  }
                  aria-hidden="true"
                ></span>
              </span>
            )}
          </NavLink>
          <a
            target="_blank"
            href={rewardsUrl}
            rel="noreferrer"
            className="relative flex items-center whitespace-nowrap text-gray-400 hover:text-white"
          >
            Rewards ✨
          </a>
          <a
            target="_blank"
            href={statsUrl}
            rel="noreferrer"
            className="relative -ml-1 flex items-center whitespace-nowrap text-gray-400 hover:text-white"
          >
            Stats
            <HiOutlineArrowSmRight className="absolute top-[2px] right-[-12px] h-3 w-3 -rotate-45" />
          </a>
        </nav>

        <div className="hidden items-center justify-self-end xl:flex">
          {showNetworkSelector ? <NetworkSelector /> : null}
          <button
            className="font-base ml-2.5 cursor-pointer rounded-xl bg-hyphen-purple bg-opacity-50 px-4 py-1 font-mono text-white"
            onClick={isLoggedIn ? showUserInfoModal : connect}
          >
            {isLoggedIn
              ? `${userAddress?.slice(0, 6)}...${userAddress?.slice(-6)}`
              : 'Connect Wallet'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
