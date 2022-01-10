import * as React from "react";
import { SpinnerCircular } from "spinners-react";

const Spinner: React.FunctionComponent<any> = (props) => {
  return (
    <SpinnerCircular
      color="#3f3c7e60"
      secondaryColor="#615ccd30"
      size="20"
      thickness={500}
      {...props}
    />
  );
};

export default Spinner;
