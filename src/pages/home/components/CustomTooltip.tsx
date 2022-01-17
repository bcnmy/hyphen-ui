import ReactTooltip from "react-tooltip";

interface ICustomTooltipProps {
  id: string;
  text: string;
}

const CustomTooltip: React.FC<ICustomTooltipProps> = ({ id, text }) => {
  return (
    <ReactTooltip
      id={id}
      className="custom-tooltip"
      effect="solid"
      place="bottom"
      arrowColor="#374151"
    >
      <span>{text}</span>
    </ReactTooltip>
  );
};

export default CustomTooltip;
