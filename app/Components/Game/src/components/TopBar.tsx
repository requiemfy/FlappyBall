import React from 'react';
import { Button, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { NAVBAR_HEIGHT } from '../utils/world/constants';

interface Props {
  running: string;
  pauseOrResume(): boolean; // toggle true/false and pass to paused
}
interface State {}

export default class TopBar extends React.PureComponent<Props, State> {
  render () {
    return (
      <View style={styles.rootContainer}>
        <View style={styles.subContainer}>
          <View style={{ width: "40%", height: "90%", backgroundColor: "black" }} ></View>

          {/* alternative button */}
          {/* <TouchableWithoutFeedback onPress={ this.props.pauseOrResume }>
            <View 
              style={{ 
                width: "40%", 
                height: "90%", 
                backgroundColor: "black",
                justifyContent: "center",
                alignItems: "center", }}>
              <Text style={{ color: "white" }}> { this.props.running } </Text>
            </View>
          </TouchableWithoutFeedback> */}

          <View 
            style={[{ width: "40%", }]}>
            <Button
              onPress={this.props.pauseOrResume}
              title={this.props.running}
              color="gray" />
          </View> 

        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rootContainer: {
    backgroundColor:"yellow",
    width: "100%",
    height: NAVBAR_HEIGHT, 
  },
  subContainer: { 
    flex: 1, 
    flexDirection: "row", 
    backgroundColor: "red" ,
    justifyContent: "space-around",
    alignItems: "center", 
  }
})