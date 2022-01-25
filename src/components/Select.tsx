import { Listbox, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import { HiCheck, HiSelector } from "react-icons/hi";
import { twMerge } from "tailwind-merge";

export interface Option {
  name: string;
  image?: string;
  id: any;
  disabled?: boolean;
  tooltip?: string;
}
export interface ISelectProps {
  options: Option[];
  selected?: Option;
  setSelected: (option: Option) => void;
  label: string;
  disabled?: boolean;
}

interface IOptionContentProps {
  option: Option;
  active: boolean;
  selected: boolean;
}

const OptionContent: React.FC<IOptionContentProps> = ({
  option,
  active,
  selected,
}) => {
  return (
    <>
      <span
        className={`${
          selected ? "font-medium" : "font-normal"
        } flex items-center truncate`}
      >
        <img className="w-5 h-5 mr-2" src={option.image} alt={option.name} />
        {option.name}
      </span>
      {selected ? (
        <span
          className={twMerge(
            active ? "text-amber-600" : "text-amber-600",
            "absolute inset-y-0 right-0 flex items-center pr-3",
            option.disabled && "text-opacity-60"
          )}
        >
          <HiCheck className="w-5 h-5" aria-hidden="true" />
        </span>
      ) : null}
    </>
  );
};

export const Select: React.FC<ISelectProps> = ({
  selected,
  setSelected,
  options,
  label,
  disabled,
}) => {
  return (
    <Listbox value={selected} onChange={setSelected} disabled={disabled}>
      <Listbox.Label className="pl-1 text-xs font-semibold capitalize text-hyphen-purple-dark text-opacity-70">
        {label}
      </Listbox.Label>
      <div className="relative h-10 mt-1">
        <Listbox.Button
          className={twMerge(
            "relative w-full h-full py-2 pl-4 pr-10 text-left bg-white rounded-lg border border-hyphen-purple border-opacity-20 cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm",
            disabled && "text-gray-900/80 bg-gray-200 cursor-not-allowed"
          )}
        >
          <span className="flex items-center truncate">
            {selected ? (
              <>
                <img
                  className="w-5 h-5 mr-2"
                  src={selected.image}
                  alt={selected.name}
                />
                {selected.name}
              </>
            ) : (
              `Select ${label}`
            )}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <HiSelector className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 min-w-full py-1 mt-2 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map((option) => (
              <Listbox.Option
                key={option.id}
                className={({ active }) =>
                  `${active ? "text-amber-900 bg-amber-100" : "text-gray-900"}
                      cursor-default select-none relative py-2 pr-10 pl-4`
                }
                value={option}
                disabled={!!option.disabled}
              >
                {({ selected, active }) => (
                  <OptionContent
                    option={option}
                    active={active}
                    selected={selected}
                  />
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default Select;
