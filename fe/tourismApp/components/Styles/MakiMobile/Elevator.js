import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
const SvgElevator = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} {...props}>
    <Path d="M11 1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1M7.5 12.5l-2-4h4Zm-2-6 2-4 2 4Z" />
  </Svg>
);
export default SvgElevator;
