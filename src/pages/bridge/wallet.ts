import { ethers } from "ethers";
import SocialLogin from "@biconomy-sdk/web3-auth";

let initializedWallet: any = false;
const getWallet = async () => {
  if (initializedWallet) {
    return initializedWallet;
  }
  const socialLoginSDK = new SocialLogin();
  await socialLoginSDK.init(ethers.utils.hexValue(5));
  initializedWallet = socialLoginSDK;
  return socialLoginSDK;
};

export default getWallet;
