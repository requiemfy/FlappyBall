import * as firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyBihnlJua8jyleOvJuCic6zw32VbyjXqYQ",
  authDomain: "flappyball-fc87c.firebaseapp.com",
  databaseURL: "https://flappyball-fc87c-default-rtdb.firebaseio.com",
  projectId: "flappyball-fc87c",
  storageBucket: "flappyball-fc87c.appspot.com",
  messagingSenderId: "412260902872",
  appId: "1:412260902872:web:29855120415292cdb374ad"
};

(function init() {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }
})();

type UserData = {
  codeName: string;
  record: number;
  [key: string]: number | string;
}

export { firebase, UserData };