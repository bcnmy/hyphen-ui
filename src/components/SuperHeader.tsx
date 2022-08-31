import React from 'react';
import { HiInformationCircle } from 'react-icons/hi';

function SuperHeader({ superHeaderMsg }: { superHeaderMsg: string }) {
  return (
    <div className="flex w-full items-center justify-center bg-[#a7731d] px-6 py-2 font-sans text-sm font-semibold text-white">
      <HiInformationCircle className="mr-2 h-3 w-3" />
      {superHeaderMsg}
    </div>
  );
}

export default SuperHeader;
