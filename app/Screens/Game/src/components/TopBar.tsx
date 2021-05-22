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
          <View style={styles.score} >
            <Text style={{ color: "white", fontSize: 40, }} >{ this.props.score }</Text>
          </View>
          <View style={[styles.menu]}>
            <Button
              onPress={this.props.pause}
              title={this.props.running}
              color="transparent" 
            />
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
    backgroundColor: "black" ,
    justifyContent: "space-around",
    alignItems: "center", 
  },
  score: { 
    width: "40%", 
    height: "90%", 
    backgroundColor: "black" ,
    alignItems: "center",
  },
  menu: { 
    width: "40%", 
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
  }
})