import * as React from 'react';
import { twMerge } from 'tailwind-merge';

interface ISecondaryButtonLightProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  className?: string;
  disabled?: boolean;
}

const SecondaryButtonLight: React.FunctionComponent<
  ISecondaryButtonLightProps
> = ({ className, children, ...props }) => {
  return (
    <button
      className={twMerge(
        `flex h-[3.75rem] w-full items-center justify-center rounded-2.5 border border-gray-200 bg-gray-50 font-semibold text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed xl:w-[15.625rem]`,
        className || '',
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default SecondaryButtonLight;
