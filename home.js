import React, { Component } from 'react';
import { StyleSheet, Text, View, AsyncStorage, StatusBar, Alert, Dimensions } from 'react-native';
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
        let { width, height } = Dimensions.get('window')
        let webConfig;
        JSON.parse(AsyncStorage.getItem('web.config', (err, res) => {
            if (err) {
                console.log(err);
            }
            console.log(res);
            webConfig = res;
        }).catch(err => { console.log(err) }));

        this.local = new Local(webConfig);

        this.initialRegion = {
            latitude: 6.455027,
            longitude: 3.284082, latitudeDelta: 0.0922, longitudeDelta: 0.0922 * (width / height)
        };
        this.state = { region: this.initialRegion, record: false, followUser: false, userLocation: new Location(), vehicles: [] }
        this.barRef = null;

        setTimeout(() => {
            StatusBar.setHidden(true);
        }, 500);

        navigator.geolocation.getCurrentPosition((loc) => {
            console.log(loc);
            let location = this.state.userLocation;
            location.latitude = loc.coords.latitude;
            location.longitude = loc.coords.longitude;
            location.timestamp = loc.timestamp
            this.setState({ userLocation: location, region: location });
        }, err => { Toast.show({ text: "Could not get your location!", type: "danger", position: "bottom" }); console.log(err); }, { enableHighAccuracy: true });


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
                    <Circle fillColor={'#111'} zIndex={18} radius={25} center={{ latitude: this.state.userLocation.latitude, longitude: this.state.userLocation.longitude }} />
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

    // TODO: remove loading font since ths is done in splashscreen
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
