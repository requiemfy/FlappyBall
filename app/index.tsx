import * as React from 'react'
import { Text, View } from 'react-native';
import { cos } from 'react-native-reanimated';
import GameMenu from './Screens/Menu/src/index';
import FlappyBallGame from './Screens/OnGame/src'; // when in src folder, no need to specify index file

// export default function Game() {
//   return (
//     // <FlappyBallGame />
//     <GameMenu />
//   );
// }

export default class Game extends React.PureComponent {
  state: { menu: boolean };

  constructor(props: any) {
    super(props);
    this.state = { menu: true };
  }

  componentWillUnmount() {
    console.log("MENU UNMOUNTING")
  }

  render() {
    // if (this.state.menu) {
    //   // return <GameMenu game = { this }/>
    //   return <GameMenu />

    // } else {
    //   return <FlappyBallGame />
    // }

    // return <FlappyBallGame />
    return <GameMenu />
  }
}