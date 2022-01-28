import { Switch } from "@headlessui/react";
import { useState } from "react";

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
            enabled ? "bg-hyphen-purple" : "bg-hyphen-purple-dark/20"
          }
          relative inline-flex flex-shrink-0 h-[24px] w-[46px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
        >
          <span className="sr-only">{label}</span>
          <span
            aria-hidden="true"
            className={`${enabled ? "translate-x-[22px]" : "translate-x-0"}
            pointer-events-none inline-block h-[20px] w-[20px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
          />
        </Switch>
      </div>
    </Switch.Group>
  );
};
