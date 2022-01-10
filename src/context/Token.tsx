import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ChainConfig } from "config/chains";
import { config } from "config";
import { TokenConfig } from "config/tokens";
import { useChains } from "context/Chains";
import { useWalletProvider } from "context/WalletProvider";
import { BigNumber, ethers } from "ethers";

import erc20ABI from "contracts/erc20.abi.json";
import toFixed from "utils/toFixed";
import useAsync, { Status } from "hooks/useLoading";
import formatRawEthValue from "utils/formatRawEthValue";

interface ITokenBalance {
  formattedBalance: string;
  displayBalance: string;
  userRawBalance: BigNumber;
}

interface ITokenContext {
  selectedToken: undefined | TokenConfig;
  selectedTokenBalance: undefined | ITokenBalance;
  compatibleTokensForCurrentChains: undefined | TokenConfig[];
  changeSelectedToken: (token: TokenConfig) => void;
  getSelectedTokenBalanceStatus: undefined | Status;
  tokensList: TokenConfig[];
}

const tokensList = config.tokens;

const TokenContext = createContext<ITokenContext | null>(null);

function isTokenValidForChains(
  token: TokenConfig,
  fromChain: ChainConfig,
  toChain: ChainConfig
) {
  // return true if token has config available for both from and to chains
  // else return false
  return !!(token[fromChain.chainId] && token[toChain.chainId]);
}

const TokenProvider: React.FC = (props) => {
  const { accounts } = useWalletProvider()!;
  const { fromChain, fromChainRpcUrlProvider, toChain } = useChains()!;
  const [selectedToken, setSelectedToken] = useState<TokenConfig>();

  // compute and memoize the compatible tokens
  const compatibleTokensForCurrentChains = useMemo(() => {
    if (!fromChain || !toChain) return;
    return config.tokens.filter((token) =>
      isTokenValidForChains(token, fromChain, toChain)
    );
  }, [fromChain, toChain]);

  const tokenContract = useMemo(() => {
    if (!selectedToken || !fromChainRpcUrlProvider || !fromChain) return;
    if (!selectedToken[fromChain.chainId]) return;

    return new ethers.Contract(
      selectedToken[fromChain.chainId].address,
      erc20ABI,
      fromChainRpcUrlProvider
    );
  }, [selectedToken, fromChainRpcUrlProvider, fromChain]);

  // set the selected token to first compatible token for current chains on startup
  // or, upon chain change, if the currently selected token is not compatible, then do the same
  useEffect(() => {
    if (!fromChain || !toChain || !compatibleTokensForCurrentChains) return;
    if (
      !selectedToken ||
      !isTokenValidForChains(selectedToken, fromChain, toChain)
    ) {
      // console.log({compatibleTokensForCurrentChains, selectedToken, fromChain})
      setSelectedToken(compatibleTokensForCurrentChains[0]);
    }
  }, [fromChain, toChain, selectedToken, compatibleTokensForCurrentChains]);

  const changeSelectedToken = useCallback(
    (token: TokenConfig) => {
      if (!fromChain || !toChain) {
        throw new Error("Chains aren't initialized yet");
      }
      if (!isTokenValidForChains(token, fromChain, toChain)) {
        throw Error("Provided token is invalid choice for current chains");
      }
      setSelectedToken(token);
    },
    [fromChain, toChain]
  );

  // construct the async function that can be called to get user balance
  const getSelectedTokenBalance = useCallback(async () => {
    if (
      !fromChainRpcUrlProvider ||
      !tokenContract ||
      !selectedToken ||
      !fromChain ||
      !accounts ||
      !accounts[0]
    ) {
      // console.error("not getting balance", {
      //   fromChainRpcUrlProvider,
      //   tokenContract,
      //   selectedToken,
      //   fromChain,
      //   accounts,
      // });
      throw new Error("Prerequisites not met");
    }
    let formattedBalance: string;
    let userRawBalance: BigNumber;

    // if selected token is native token for fromChain
    if (
      selectedToken[fromChain.chainId].address.toLowerCase() ===
      config.constants.NATIVE_ADDRESS
    ) {
      userRawBalance = await fromChainRpcUrlProvider.getBalance(accounts[0]);
      let decimals = fromChain.nativeDecimal;

      formattedBalance = formatRawEthValue(userRawBalance.toString(), decimals);
    } else {
      userRawBalance = await tokenContract.balanceOf(accounts[0]);
      let decimals = await tokenContract.decimals();

      formattedBalance = formatRawEthValue(userRawBalance.toString(), decimals);
    }
    let displayBalance = toFixed(
      formattedBalance,
      selectedToken[fromChain.chainId].fixedDecimalPoint || 4
    );

    // console.log({
    //   formattedBalance,
    //   displayBalance,
    //   userRawBalance,
    //   fromChain,
    //   fromChainRpcUrlProvider,
    //   selectedToken,
    // });

    return { formattedBalance, displayBalance, userRawBalance };
  }, [
    fromChainRpcUrlProvider,
    selectedToken,
    accounts,
    fromChain,
    tokenContract,
  ]);

  const {
    execute: refreshSelectedTokenBalance,
    value: selectedTokenBalance,
    status: getSelectedTokenBalanceStatus,
    // error: getSelectedTokenBalanceError,
  } = useAsync(getSelectedTokenBalance);

  // console.log({selectedTokenBalance});

  useEffect(() => {
    refreshSelectedTokenBalance();
  }, [getSelectedTokenBalance, refreshSelectedTokenBalance]);

  return (
    <TokenContext.Provider
      value={{
        changeSelectedToken,
        selectedToken,
        selectedTokenBalance,
        compatibleTokensForCurrentChains,
        getSelectedTokenBalanceStatus,
        tokensList,
      }}
      {...props}
    />
  );
};

const useToken = () => useContext(TokenContext);
export { TokenProvider, useToken };
