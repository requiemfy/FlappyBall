import * as React from 'react'
import { Button, StatusBar, Text, View } from 'react-native';
import { cos } from 'react-native-reanimated';

export default function GameMenu(props: any) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: "yellow",}}>
      
      <View style={{ // for semi gray background
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "gray",
        opacity: 0.3, 
        }}>
      </View>

      <View style={{
        position: "absolute",
        backgroundColor: "transparent",
        width: "100%",
        height: "100%",        
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}>

        <View style={{
          backgroundColor: "green",
          width: "70%",
          height: "50%",
          }}>
            <View style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center", }}>
              <View><Text>FLAPPY BALL</Text></View>
              <View>
                <Button 
                  title="SOLO GAME" 
                  onPress={ () => {
                    props.game.setState({ menu: false });
                    console.log("PRESSED SOLO")
                  
                  }} />
              </View>
            </View>
        </View>

      </View>

      <StatusBar hidden />

    </View>
  );
}