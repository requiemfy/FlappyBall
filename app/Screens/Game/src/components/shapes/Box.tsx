// quadrilateral matter template

import { Body } from 'matter-js';
import * as React from 'react'
import { TouchableWithoutFeedback, View } from "react-native";

export interface Props {
  size: number[];
  body: Body;
  borderRadius: number;
  color: string;
}
export interface State { }

// PureComponent won't work
export default class Box extends React.Component<Props, State> {
  componentWillUnmount() {
    console.log("UNMOUNTING.... BOX");
  }

  render() {
    const
      width = this.props.size[0],
      height = this.props.size[1],
      x = this.props.body.position.x - (width / 2),
      y = this.props.body.position.y - (height / 2);
    ////////////////////////////////////////////////////////////
    // console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    // console.log("Box.tsx: RENDERING CLASS BOX");
    // console.log(
    //   "\t center matter body x,y: " + 
    //   this.props.body.position.x + ", " +
    //   this.props.body.position.y
    // );
    // console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    ////////////////////////////////////////////////////////////
    return (
      <View
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: width,
          height: height,
          borderRadius: this.props.borderRadius,
          backgroundColor: this.props.color || "pink",
        }}>
        {this.props.children}
      </View>
    );
  }
}
