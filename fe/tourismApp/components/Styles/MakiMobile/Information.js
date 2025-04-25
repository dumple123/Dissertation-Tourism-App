import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
const SvgInformation = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} {...props}>
    <Path d="M7.5 1C6.7 1 6 1.7 6 2.5S6.7 4 7.5 4 9 3.3 9 2.5 8.3 1 7.5 1M4 5v1s2 0 2 2v2c0 2-2 2-2 2v1h7v-1s-2 0-2-2V6c0-.5-.5-1-1-1z" />
  </Svg>
);
export default SvgInformation;
