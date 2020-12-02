import { Alert } from "react-native";

export function gameOverAlert() {
  Alert.alert(
    "GAME OVER",
    "Sorry dude",
    [{ text: "OK", onPress: () => console.log("OK Pressed") }],
    { cancelable: false }
  );
}