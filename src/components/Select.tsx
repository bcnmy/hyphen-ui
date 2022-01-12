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
}

export const Select: React.FunctionComponent<ISelectProps> = ({
  selected,
  setSelected,
  options,
  label,
}) => {
  return (
    <Listbox value={selected} onChange={setSelected}>
      <Listbox.Label className="text-xs uppercase font-semibold text-hyphen-purple-dark text-opacity-70 pl-1">
        {label}
      </Listbox.Label>
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full py-2 pl-4 pr-10 text-left bg-white rounded-lg shadow-md border border-hyphen-purple border-opacity-20 cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
          <span className="block truncate">
            {selected ? selected.name : ""}
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
          <Listbox.Options className="absolute min-w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
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
                  <>
                    <span
                      className={`${
                        selected ? "font-medium" : "font-normal"
                      } block truncate`}
                    >
                      {/* <img src={option.image} alt={option.name} /> */}
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
