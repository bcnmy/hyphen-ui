import { Switch } from '@headlessui/react';

interface IToggleProps {
  label: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const Toggle: React.FC<IToggleProps> = ({
  label,
  enabled,
  onToggle,
}) => {
  return (
    <Switch.Group>
      <div className="flex flex-col">
        <Switch
          checked={enabled}
          onChange={onToggle}
          className={`${
            enabled ? 'bg-hyphen-yellow-100' : 'bg-hyphen-yellow-100/60'
          }
          relative inline-flex h-[10px] w-[20px] flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
        >
          <span className="sr-only">{label}</span>
          <span
            aria-hidden="true"
            className={`${
              enabled ? 'translate-x-[11.5px]' : 'translate-x-[1.25px]'
            }
            pointer-events-none inline-block h-[7px] w-[7px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
          />
        </Switch>
      </div>
    </Switch.Group>
  );
};
