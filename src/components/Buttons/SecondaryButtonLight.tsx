import * as React from "react";
import { twMerge } from "tailwind-merge";

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
        `pt-3.5 pb-3 px-8 rounded-full bg-hyphen-purple bg-opacity-5 border-hyphen-purple/20 border font-medium text-hyphen-purple-dark/80 disabled:text-hyphen-purple/20 disabled:disabled:bg-opacity-5 disabled:border-hyphen-purple/5
        disabled:cursor-not-allowed`,
        className || ""
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default SecondaryButtonLight;
