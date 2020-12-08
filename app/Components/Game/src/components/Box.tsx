// quadrilateral matter template

import * as React from 'react'
import { TouchableWithoutFeedback, View } from "react-native";

interface BoxProps {
  size:number[],
  body:any, 
  borderRadius:number,
  color:string
}
interface BoxState {}

// PureComponent won't work
export default class Box extends React.Component<BoxProps, BoxState> {
  componentWillUnmount() {
    console.log("UNMOUNTING....");
  }

  render() {
    const width = this.props.size[0];
    const height = this.props.size[1];
    const x = this.props.body.position.x - (width / 2);
    const y = this.props.body.position.y - (height / 2);
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
        backgroundColor: this.props.color || "pink"
      }}/>
    );
  }
}
