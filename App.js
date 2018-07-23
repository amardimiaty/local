import React from 'react';
import { StyleSheet, Text, View, Geolocation, StatusBar } from 'react-native';
// import MapView from 'react-native-maps';
import { Root } from 'native-base';
import Expo, { MapView } from 'expo';
import Omnibar from './components/Omnibar';
import Local from './src/Local'

export default class App extends React.Component {
    constructor(props) {
        super(props)
        this.local = new Local()
        this.initialRegion = { latitude: 6.455027, longitude: 3.384082, latitudeDelta: 0, longitudeDelta: 0 };
        this.state = { region: this.initialRegion }

        setTimeout(() => {
            StatusBar.setHidden(true);
        }, 100);
    }

    render() {
        return (
            <Root style={styles.container}>
            <View>
                <Omnibar style={styles.widgets} />
                </View>
                <MapView loadingEnabled={true} followsUserLocation={true} provider={"google"} showsUserLocation={true} region={this.state.region} onRegionChange={this.onRegionChange} style={styles.map} initialRegion={this.initialRegion} />
            </Root>
        );
    }

    async componentWillMount() {
        await Expo.Font.loadAsync({
            'Roboto': require('native-base/Fonts/Roboto.ttf'),
            'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
        });
    }

    onRouteChange(newRoute) {

    }

    onUserLocationChange(newLocation) {

    }
}
const margin = 15;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0ff',
        alignItems: 'stretch',
    },
    map: {
        // flex: 1,
        //        zIndex: 1
    },
    widgets: {
        height: 50,
        backgroundColor: "#335",
        margin: margin,
        marginTop: StatusBar.currentHeight + margin,
        padding: 0,
        borderRadius: 10,
        justifyContent: "center", alignItems: "stretch", flex: 1, flexDirection: "row"
        // zIndex: 5
    }
});
