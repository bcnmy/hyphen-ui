import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const customSliderStyles = {
  activeDotStyle: {
    backgroundColor: '#615ccd',
    borderColor: 'white',
    bottom: '-3px',
    height: '10px',
    width: '10px',
  },
  dotStyle: {
    backgroundColor: '#c4c4c4',
    borderColor: 'white',
    bottom: '-3px',
    height: '10px',
    width: '10px',
  },
  handleStyle: {
    backgroundColor: '#615ccd',
    borderColor: 'white',
    height: '20px',
    width: '20px',
    marginTop: '-8px',
  },
  railStyle: {
    backgroundColor: '#c4c4c4',
  },
  trackStyle: {
    backgroundColor: '#615ccd',
  },
};

interface IStepSlider {
  disabled?: boolean | false;
  dots?: boolean | false;
  onChange: (value: number) => void;
  step?: number | 1;
  value: number;
}

// TODO: Add option to make the slider controlled and uncontrolled.
// TODO: Allow the user to override custom styles.
// This can be done by making the value prop optional.
function StepSlider({ disabled, dots, onChange, step, value }: IStepSlider) {
  return (
    <Slider
      step={step}
      dots={dots}
      activeDotStyle={customSliderStyles.activeDotStyle}
      dotStyle={customSliderStyles.dotStyle}
      handleStyle={customSliderStyles.handleStyle}
      railStyle={customSliderStyles.railStyle}
      trackStyle={customSliderStyles.trackStyle}
      onChange={onChange}
      disabled={disabled}
      value={value}
    />
  );
}

export default StepSlider;
