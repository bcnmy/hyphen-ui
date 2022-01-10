import * as React from "react";
import { SpinnerCircular } from "spinners-react";

const SpinnerDark: React.FunctionComponent<any> = (props) => {
  return (
    <SpinnerCircular
      color="#ffffff60"
      secondaryColor="#ffffff30"
      size="20"
      thickness={500}
      {...props}
    />
  );
};

export default SpinnerDark;
