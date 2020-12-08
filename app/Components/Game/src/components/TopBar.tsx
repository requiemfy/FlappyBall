import React from 'react';
import { Text, TouchableWithoutFeedback, View } from 'react-native';
import { NAVBAR_HEIGHT } from '../utils/world/constants';

interface Props {
  running: boolean;
  pauseOrResume(): boolean; // toggle true/false and pass to paused
}
interface State {}

export default class TopBar extends React.PureComponent<Props, State> {
  render () {
    return (
      <View style={{ // @remind make nav bar tsx
        backgroundColor:"yellow",
        width: "100%",
        height: NAVBAR_HEIGHT,
      }}>
        <View style={{ 
            flex: 1, 
            flexDirection: "row", 
            backgroundColor: "red" ,
            justifyContent: "space-around",
            alignItems: "center",
          }}>
          <View style={{ width: "40%", height: "90%", backgroundColor: "black" }} ></View>
          <TouchableWithoutFeedback onPress={ this.props.pauseOrResume }>
            <View style={{ 
              width: "40%", 
              height: "90%", 
              backgroundColor: "black",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <Text style={{ color: "white" }}> { this.props.running } </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  }
}
