import React, { Component } from 'react';
import { StyleSheet, Text, View, Geolocation, StatusBar, Alert } from 'react-native';
import { Circle, Marker, UrlTile, LocalTile } from 'react-native-maps';
import { Root, Toast, ActionSheet } from 'native-base';
import Expo, { MapView } from 'expo';
import Omnibar from './components/Omnibar';
import Local from './src/Local'
import Route, { Location } from './src/Route';

export default class Home extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props)
        this.local = new Local()
        this.initialRegion = {
            latitude: 6.455027,
            longitude: 3.284082, latitudeDelta: 0, longitudeDelta: 0
        };
        this.state = { region: this.initialRegion, record: false, followUser: false, userLocation: new Location(), vehicles: [] }
        this.barRef = null

        setTimeout(() => {
            StatusBar.setHidden(true);
        }, 100);

        navigator.geolocation.getCurrentPosition((loc) => {
            console.log(loc);
            let location = this.state.userLocation;
            location.latitude = loc.latitude;
            location.longitude = loc.longitude;
            this.setState({ userLocation: location });
            this.state.region = location;
        }, null, { enableHighAccuracy: true });

    }

    componentDidMount() {
        try {
            this.local.getVehicles((veh) => {
                this.setState({ vehicles: veh });
            });
        } catch (err) {
            Alert.alert("Error occurred", err.message);
        }
    }

    render() {
        return (
            <Root style={styles.container}>
                <MapView showsCompass={true} loadingEnabled={true} onMapReady={() => { Toast.show({ text: "Map ready!", position: "bottom", type: "success" }) }} followsUserLocation={this.state.followUser} provider={null} showsUserLocation={true} onUserLocationChange={this.onUserLocationChange.bind(this)} region={this.state.region} onRegionChange={this.onRegionChange.bind(this)} style={styles.map} initialRegion={this.initialRegion} mapType={"none"} >
                    <LocalTile pathTemplate={"./assets/tiles/{z}/{x}/{y}.png"} zIndex={12} />
                    <Circle zIndex={18} radius={25} center={{ latitude: this.state.userLocation.latitude, longitude: this.state.userLocation.longitude }} />
                    {this.state.vehicles ? this.state.vehicles.map((vehicle) => {
                        <Marker title={vehicle.title} coordinate={{ longitude: vehicle.location.longitude, latitude: vehicle.location.latitude }} description={vehicle.brand + " " + vehicle.model + " (" + vehicle.type + "), " + vehicle.year} />
                    }) : null}
                </MapView>
                <View style={styles.widgets} >
                    <Omnibar ref={(ref) => { this.barRef = ref }} cars={this.state.vehicles} />
                </View>
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
        console.log(newLocation);
        let loc = this.state.userLocation;
        loc.latitude = newLocation.latitude;
        loc.longitude = newLocation.longitude;
        this.setState({ userLocation: loc });
    }

    onRegionChange(region) {

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
        backgroundColor: "#000",
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
        //    zIndex: 1
    },
    widgets: {
        height: 50,
        backgroundColor: "#335",
        margin: margin,
        marginTop: StatusBar.currentHeight + margin,
        padding: 0,
        borderRadius: 10,
        // zIndex: 5
    }
});
