import { Listbox, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';
import { HiCheck, HiOutlineChevronDown } from 'react-icons/hi';
import { twMerge } from 'tailwind-merge';
import noSelectIcon from 'assets/images/no-select-icon.svg';

export interface Option {
  name: string;
  image?: string;
  id: any;
  disabled?: boolean;
  tooltip?: string;
}
export interface ISelectProps {
  className?: string;
  disabled?: boolean;
  options: Option[] | undefined;
  label: string;
  selected?: Option;
  setSelected: (option: Option) => void;
  style?: React.CSSProperties;
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
          selected ? 'font-medium' : 'font-normal'
        } flex items-center truncate text-sm xl:text-base`}
      >
        {option.image ? (
          <img
            className="mr-2 h-4 w-4 xl:h-5 xl:w-5"
            src={option.image}
            alt={option.name}
          />
        ) : null}
        {option.name}
      </span>
      {selected ? (
        <span
          className={twMerge(
            active ? 'text-amber-600' : 'text-amber-600',
            'absolute inset-y-0 right-0 flex items-center pr-3',
            option.disabled && 'text-opacity-60',
          )}
        >
          <HiCheck className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : null}
    </>
  );
};

// TODO: Change this to compound component so that it's easier to use.
export const Select: React.FC<ISelectProps> = ({
  className,
  disabled,
  options,
  label,
  selected,
  setSelected,
  style,
}) => {
  return (
    <div className="flex flex-col">
      <Listbox value={selected} onChange={setSelected} disabled={disabled}>
        <Listbox.Label className="pl-5 text-xxxs font-semibold uppercase text-hyphen-gray-400 xl:text-xxs">
          {label}
        </Listbox.Label>
        <div className="relative mt-2 h-15">
          <Listbox.Button
            className={twMerge(
              'relative h-full w-full cursor-pointer rounded-2.5 border border-hyphen-gray-100 bg-white py-2 pl-4 pr-10 text-left text-sm focus:outline-none xl:text-base',
              disabled &&
                'cursor-not-allowed bg-hyphen-gray-100 text-gray-900/80',
              className,
            )}
            style={style}
          >
            <span className="flex items-center truncate">
              {selected ? (
                <>
                  {selected.image ? (
                    <img
                      className="mr-2 h-4 w-4 xl:h-5 xl:w-5"
                      src={selected.image}
                      alt={selected.name}
                    />
                  ) : null}
                  {selected.name}
                </>
              ) : (
                <>
                  <img
                    src={noSelectIcon}
                    alt={`Select ${label}`}
                    className="mr-2 h-4 w-4 xl:h-5 xl:w-5"
                  />
                  Select {label}
                </>
              )}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-1 flex items-center pr-2">
              <HiOutlineChevronDown
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-2 max-h-60 min-w-full overflow-auto rounded-2.5 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options?.map(option => (
                <Listbox.Option
                  key={option.id}
                  className={({ active }) =>
                    `${active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'}
              relative cursor-pointer select-none py-2 pr-10 pl-4`
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
    </div>
  );
};

export default Select;
