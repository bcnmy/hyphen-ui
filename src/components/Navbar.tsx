import * as React from "react";
import { HiOutlineExternalLink } from "react-icons/hi";

interface INavbarProps {}

const Navbar: React.FunctionComponent<INavbarProps> = (props) => {
  return (
    <div className="flex sticky top-0 bg-hyphen-purple bg-opacity-10 backdrop-blur-sm border-b shadow-sm border-black border-opacity-20 text-white py-2">
      <div className="max-w-5xl mx-auto flex-grow flex justify-between items-center">
        <div className="flex flex-grow mx-4 font-semibold tracking-wide ">
          <span className="flex items-center gap-2 text-opacity-90 text-white">
            Analytics <HiOutlineExternalLink />
          </span>
          <div className="px-4 py-2 bg-white bg-opacity-10 shadow-md rounded-full font-mono text-white text-opacity-75 border border-opacity-10 border-white ml-auto font-normal relative backdrop-blur-md cursor-pointer hover:bg-opacity-[0.15] hover:text-opacity-90 hover:border-opacity-20 hover:shadow-lg transition">
            <div className="absolute opacity-80 -inset-[2px] bg-gradient-to-br from-white/10 to-hyphen-purple/30 blur-md -z-10"></div>
            0x12..132
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
