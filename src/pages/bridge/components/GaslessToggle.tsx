import { HiInformationCircle } from 'react-icons/hi';
import { useBiconomy } from 'context/Biconomy';
import CustomTooltip from 'components/CustomTooltip';
import { Toggle } from 'components/Toggle';

function GaslessToggle() {
  const { isBiconomyAllowed, isBiconomyEnabled, setIsBiconomyToggledOn } =
    useBiconomy()!;

  return (
    <div className="mb-2 flex items-center justify-end">
      <div className="flex items-center">
        <HiInformationCircle
          data-tip
          data-for="gaslessMode"
          className="mr-1 h-2.5 w-2.5 text-hyphen-yellow-100"
        />
        <CustomTooltip id="gaslessMode">
          <span>This transaction is sponsored by Biconomy</span>
        </CustomTooltip>
        <div
          className={
            !isBiconomyAllowed
              ? 'flex cursor-not-allowed items-center opacity-50'
              : 'flex cursor-pointer items-center'
          }
          data-tip
          data-for="whyGaslessDisabled"
          onClick={() => setIsBiconomyToggledOn(!isBiconomyEnabled)}
        >
          <span className="mr-2 text-xxxs font-bold uppercase text-hyphen-yellow-100 xl:text-xxs">
            Go Gasless
          </span>
          <Toggle
            label="Go Gasless"
            enabled={isBiconomyEnabled}
            onToggle={enabled => setIsBiconomyToggledOn(enabled)}
          />
        </div>
      </div>
      {!isBiconomyAllowed && (
        <CustomTooltip id="whyGaslessDisabled">
          <span>Disabled for selected chain</span>
        </CustomTooltip>
      )}
    </div>
  );
}

export default GaslessToggle;
