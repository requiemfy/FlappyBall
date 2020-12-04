// quadrilateral matter template

import * as React from 'react'
import { TouchableWithoutFeedback, View } from "react-native";

interface CircleProps {
  size:number,
  body:any, 
  borderRadius:number,
  color:string
}
interface CircleState {}

// PureComponent won't work
export default class Circle extends React.Component<CircleProps, CircleState> {
  componentWillUnmount() {
    console.log("UNMOUNTING....");
  }

  render() {
    const size = this.props.size,
          x = this.props.body.position.x - (size / 2),
          y = this.props.body.position.y - (size / 2);
    return (
      <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: this.props.borderRadius,
        backgroundColor: this.props.color || "pink"
      }}/>
    );
  }
}
