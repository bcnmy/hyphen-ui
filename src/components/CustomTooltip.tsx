import ReactTooltip from 'react-tooltip';

interface ICustomTooltipProps {
  id: string;
  children?: React.ReactNode;
}

const CustomTooltip: React.FC<ICustomTooltipProps> = ({ id, children }) => {
  return (
    <ReactTooltip
      id={id}
      className="!w-auto !max-w-[160px] !rounded-md !bg-hyphen-purple !px-2 !py-1 !font-sans !text-xxs"
      effect="solid"
      place="bottom"
      arrowColor="#615ccd"
    >
      {children}
    </ReactTooltip>
  );
};

export default CustomTooltip;
