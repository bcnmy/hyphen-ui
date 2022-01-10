import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface IPrimaryButtonDarkProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  className?: string;
  disabled?: boolean;
}

export const PrimaryButtonDark: React.FC<IPrimaryButtonDarkProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={twMerge(
        "px-4 py-2 bg-white bg-opacity-10 shadow-md rounded-full text-white text-opacity-75 border border-opacity-10 border-white ml-auto font-normal relative backdrop-blur-md cursor-pointer hover:bg-opacity-[0.15] hover:text-opacity-90 hover:border-opacity-20 hover:shadow-lg transition",
        className
      )}
      {...props}
    >
      <span className="absolute opacity-80 -inset-[2px] bg-gradient-to-br from-white/10 to-hyphen-purple/30 blur-md -z-10"></span>
      {children}
    </button>
  );
};
