import * as firebase from 'firebase/app';
import * as Auth from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBihnlJua8jyleOvJuCic6zw32VbyjXqYQ",
  authDomain: "flappyball-fc87c.firebaseapp.com",
  projectId: "flappyball-fc87c",
  storageBucket: "flappyball-fc87c.appspot.com",
  messagingSenderId: "412260902872",
  appId: "1:412260902872:web:29855120415292cdb374ad"
};

export function init() {
  firebase.initializeApp(firebaseConfig);
}

export { firebase, Auth };