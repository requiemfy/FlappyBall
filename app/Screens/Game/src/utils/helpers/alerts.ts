import { Alert } from "react-native";

export namespace GameAlert {
  export function hasUpdate() {
    Alert.alert(
      "UPDATE AVAILABLE",
      "",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }],
      { cancelable: false }
    );
  }
}

