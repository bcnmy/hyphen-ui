import { Switch } from '@headlessui/react';
interface IToggleProps {
  bgColor: string;
  enabled: boolean;
  disabled?: boolean;
  label: string;
  onToggle: (enabled: boolean) => void;
  variant?: string;
}

export const Toggle: React.FC<IToggleProps> = ({
  bgColor,
  enabled,
  disabled,
  label,
  onToggle,
  variant = 'small',
}) => {
  return (
    <Switch
      checked={enabled}
      disabled={disabled}
      onChange={onToggle}
      className={`
        tw-hw-relative tw-hw-inline-flex tw-hw-flex-shrink-0 tw-hw-cursor-pointer tw-hw-items-center tw-hw-rounded-full tw-hw-transition-colors tw-hw-duration-200 tw-hw-ease-in-out focus:tw-hw-outline-none focus-visible:tw-hw-ring-2  focus-visible:tw-hw-ring-white focus-visible:tw-hw-ring-opacity-75
        ${enabled ? bgColor : `${bgColor}/60`}
        ${
          variant === 'small'
            ? 'tw-hw-h-[10px] tw-hw-w-[20px]'
            : 'tw-hw-h-[20px] tw-hw-w-[40px]'
        }
      `}
      style={{
        backgroundColor: enabled ? bgColor : `${bgColor}60`,
      }}
    >
      <span className="tw-hw-sr-only">{label}</span>
      <span
        aria-hidden="true"
        className={`
          tw-hw-pointer-events-none tw-hw-inline-block tw-hw-transform tw-hw-rounded-full tw-hw-bg-white tw-hw-shadow-lg tw-hw-ring-0 tw-hw-transition tw-hw-duration-200 tw-hw-ease-in-out
          ${
            variant === 'small'
              ? enabled
                ? 'tw-hw-h-[7px] tw-hw-w-[7px] tw-hw-translate-x-[11.5px]'
                : 'tw-hw-h-[7px] tw-hw-w-[7px] tw-hw-translate-x-[1.25px]'
              : ''
          }
          ${
            variant === 'large'
              ? enabled
                ? 'tw-hw-h-[14px] tw-hw-w-[14px] tw-hw-translate-x-[23px]'
                : 'tw-hw-h-[14px] tw-hw-w-[14px] tw-hw-translate-x-[3px]'
              : ''
          }
        `}
      />
    </Switch>
  );
};