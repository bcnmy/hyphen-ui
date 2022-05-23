import { Switch } from '@headlessui/react';

interface IToggleProps {
  enabled: boolean;
  label: string;
  onToggle: (enabled: boolean) => void;
  switchClass?: string;
  toggleClass?: string;
  variant?: string;
}

export const Toggle: React.FC<IToggleProps> = ({
  enabled,
  label,
  onToggle,
  switchClass,
  toggleClass,
  variant = 'small',
}) => {
  return (
    <Switch
      checked={enabled}
      onChange={onToggle}
      className={`
        relative inline-flex flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75
        ${enabled ? 'bg-hyphen-yellow-100' : 'bg-hyphen-yellow-100/60'}
        ${variant === 'small' ? 'h-[10px] w-[20px]' : 'h-[20px] w-[40px]'}
        ${switchClass ? switchClass : ''}
      `}
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out
          ${
            variant === 'small'
              ? enabled
                ? 'h-[7px] w-[7px] translate-x-[11.5px]'
                : 'h-[7px] w-[7px] translate-x-[1.25px]'
              : ''
          }
          ${
            variant === 'large'
              ? enabled
                ? 'h-[14px] w-[14px] translate-x-[23px]'
                : 'h-[14px] w-[14px] translate-x-[3px]'
              : ''
          }
          ${toggleClass ? toggleClass : ''}
        `}
      />
    </Switch>
  );
};
