import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface IStepSlider {
  dots?: boolean | false;
  onChange: (value: number) => void;
  step?: number | 1;
}

function StepSlider({ dots, onChange, step }: IStepSlider) {
  return (
    <Slider
      step={step}
      dots={dots}
      activeDotStyle={{
        backgroundColor: '#615ccd',
        borderColor: 'white',
        bottom: '-3px',
        height: '10px',
        width: '10px',
      }}
      dotStyle={{
        backgroundColor: '#c4c4c4',
        borderColor: 'white',
        bottom: '-3px',
        height: '10px',
        width: '10px',
      }}
      handleStyle={{
        backgroundColor: '#615ccd',
        borderColor: 'white',
        height: '20px',
        width: '20px',
        marginTop: '-8px',
      }}
      railStyle={{
        backgroundColor: '#c4c4c4',
      }}
      trackStyle={{
        backgroundColor: '#615ccd',
      }}
      onChange={onChange}
    />
  );
}

export default StepSlider;
