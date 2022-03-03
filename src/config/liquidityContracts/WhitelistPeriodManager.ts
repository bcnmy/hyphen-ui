import { FUJI } from 'config/chains/constants/Fuji';
import { GOERLI } from 'config/chains/constants/Goerli';
import { MUMBAI } from 'config/chains/constants/Mumbai';
import { LiquidityContractConfig } from '.';

export const WhitelistPeriodManager: LiquidityContractConfig = {
  name: 'WhitelistPeriodManager',
  [MUMBAI.chainId]: {
    address: '0x186ff65eE39bCc1B7AB06059576FFd30EA55c4eD',
  },
  [GOERLI.chainId]: {
    address: '0x6fa46880fC890EBa8c87A7DfBB5c5854771E3B69',
  },
  [FUJI.chainId]: {
    address: '0x111BE5f072f1d5fC07702472f455e06256cD024c',
  },
};
