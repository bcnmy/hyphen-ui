import * as React from 'react';
import { twMerge } from 'tailwind-merge';

interface IPrimaryButtonLightProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  className?: string;
  disabled?: boolean;
}

const PrimaryButtonLight: React.FunctionComponent<IPrimaryButtonLightProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={twMerge(
        `flex h-[3.75rem] w-[15.625rem] items-center justify-center rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300`,
        className || '',
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButtonLight;
