import { Alert } from "react-native";

export namespace GameAlert {
  // export function gameOver() {
  //   Alert.alert(
  //     "GAME OVER",
  //     "Sorry dude",
  //     [{ text: "OK", onPress: () => console.log("OK Pressed") }],
  //     { cancelable: false }
  //   );
  // } // @remind clear

  export function hasUpdate() {
    Alert.alert(
      "UPDATE AVAILABLE",
      "",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }],
      { cancelable: false }
    );
  }
}

