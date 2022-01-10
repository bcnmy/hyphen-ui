import * as React from "react";
import { twMerge } from "tailwind-merge";

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
        `pt-3.5 pb-3 px-6 rounded-full bg-hyphen-purple bg-opacity-20 border-hyphen-purple/10 border text-hyphen-purple-dark/80 shadow-md font-semibold shadow-hyphen-purple/30 hover:shadow transition-all disabled:text-hyphen-purple/20 disabled:shadow-sm disabled:bg-opacity-10 disabled:cursor-not-allowed`,
        className || ""
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButtonLight;
