import { Body } from 'matter-js';
import * as React from 'react'
import { View } from "react-native";

export interface Props {
  size: number;
  body: Body;
  borderRadius: number;
  color: string;
}
export interface State { }

// PureComponent won't work
export default class Circle extends React.Component<Props, State> {

  render() {
    const
      size = this.props.size,
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
          backgroundColor: this.props.color || "pink",
        }}>
        {this.props.children}
      </View>
    );
  }
}
