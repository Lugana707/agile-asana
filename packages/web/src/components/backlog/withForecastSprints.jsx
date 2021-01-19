import React from "react";
import { useSelector } from "react-redux";
import { selectForecastSprints } from "../../scripts/redux/selectors/forecastSprints";

export default WrappedComponent => props => {
  const forecastSprints = useSelector(selectForecastSprints);

  return <WrappedComponent {...props} forecastSprints={forecastSprints} />;
};
