import * as fBase from 'firebase';
import React from 'react';
import { createStackNavigator } from 'react-navigation';
import Home from './home';
import Splash from './SplashScreen';


export const FIREBASE = fBase.initializeApp({
    apiKey: "AIzaSyDz3BuwyGYx8XtH5L4BVC4jFgId1Rn11yQ",
    authDomain: "local-00000.firebaseapp.com",
    databaseURL: "https://local-00000.firebaseio.com",
    storageBucket: "local-00000.appspot.com",
    messagingSenderId: "1042041164043"
});

const RootComponent = createStackNavigator({ Home: { screen: Home }, Splash: { screen: Splash } }, { initialRouteName: "Splash" });

export default class App extends React.Component {
    
    render() {
        return (
            <RootComponent navigationOptions={{ header: null }} />
        );
    }
}

export const version = '1.0.0.44';