import ReactTooltip from 'react-tooltip';

interface ICustomTooltipProps {
  id: string;
  children?: React.ReactNode;
}

const CustomTooltip: React.FC<ICustomTooltipProps> = ({ id, children }) => {
  return (
    <ReactTooltip
      id={id}
      className="custom-tooltip"
      effect="solid"
      place="bottom"
      arrowColor="#615CCD75"
    >
      {children}
    </ReactTooltip>
  );
};

export default CustomTooltip;
