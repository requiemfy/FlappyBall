import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { NAVBAR_HEIGHT } from '../utils/world/constants';

interface Props {
  score: number;
  running: string;
  pause(): boolean;
}
interface State {}

export default class TopBar extends React.PureComponent<Props, State> {
  render () {
    return (
      <View style={styles.rootContainer}>
        <View style={styles.subContainer}>

          <View style={{ width: "40%", height: "90%", backgroundColor: "black" }} >
            <Text style={{ color: "white" }} >{ this.props.score }</Text>
          </View>

          <View style={[{ width: "40%", }]}>
            <Button
              onPress={this.props.pause}
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