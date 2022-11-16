import { useBiconomy } from 'context/Biconomy';
// import CustomTooltip from 'components/CustomTooltip';
import { Toggle } from 'components/Toggle';
// import { useChains } from 'context/Chains';

function GaslessToggle() {
  const { isBiconomyToggledOn, setIsBiconomyToggledOn } = useBiconomy()!;
  // const { fromChain } = useChains()!;

  return (
    <div className="tw-hw-mb-2 tw-hw-flex tw-hw-items-center tw-hw-justify-center">
      <div className="tw-hw-flex tw-hw-items-center">
        <div
          className={'tw-hw-flex tw-hw-cursor-pointer tw-hw-items-center'}
          data-tip
          data-for="gaslessToggleTooltip"
          onClick={() => setIsBiconomyToggledOn(!isBiconomyToggledOn)}
        >
          <span className="tw-hw-mr-2 tw-hw-text-xxxs tw-hw-font-bold tw-hw-uppercase tw-hw-text-hyphen-gray-400 md:tw-hw-text-xxs">
            Forward
          </span>
          <Toggle
            bgColor="#CCBA5C"
            label="Go Gasless"
            enabled={isBiconomyToggledOn}
            onToggle={enabled => setIsBiconomyToggledOn(!enabled)}
          />
          <span className="tw-hw-ml-2 tw-hw-text-xxxs tw-hw-font-bold tw-hw-uppercase tw-hw-text-hyphen-gray-400 md:tw-hw-text-xxs">
            Gasless
          </span>
        </div>
      </div>
      {/* <CustomTooltip id="gaslessToggleTooltip">
        <span>
          Gasless transactions on{' '}
          <span className="whitespace-nowrap">{fromChain?.name} ✨</span>
        </span>
      </CustomTooltip> */}
    </div>
  );
}

export default GaslessToggle;
