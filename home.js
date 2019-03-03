import React, { Component } from 'react';
import { StyleSheet, Text, View, AsyncStorage, ToastAndroid, Platform, StatusBar, Alert, Dimensions, Image } from 'react-native';
import { Circle, Marker, UrlTile, LocalTile } from 'react-native-maps';
import { Root, Toast, ActionSheet } from 'native-base';
import Expo, { MapView } from 'expo';
import Omnibar, { AddCarDialog, ListCarDialog } from './components/Omnibar';
import Local, { Vehicle } from './src/Local'
import { Location } from './src/Route';

export default class Home extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props)
        let { width, height } = Dimensions.get('window');

        // let webConfig = this.props.navigation.getParam('local');
        // console.log(55559,webConfig);
        /* 
        AsyncStorage.getItem('web.config', (err, res) => {
             if (err) {
                 console.log(err);
             }
             console.log(res);
             webConfig = JSON.parse(res);
         }).catch(err => { console.log(err) });
         */

        let local = this.props.navigation.getParam('local');
        console.log(55559, local);

        let user = this.props.navigation.state.params.user;
        if (user.isNew) {
            Local.toast("Welcome to Local!");
        }

        this.state = {
            local: local, region: {
                latitude: 6.455027,
                longitude: 3.284082, latitudeDelta: 0.0922, longitudeDelta: 0.0922 * (width / height)
            },
            record: false, followUser: true,
            userLocation: new Location(), vehicles: [],
            carDialog: false, listDialog: false
        }
        this.barRef = null;

        setTimeout(() => {
            StatusBar.setHidden(true);
        }, 500);


    }

    componentDidMount() {

        navigator.geolocation.getCurrentPosition((loc) => {
            console.log(50505150505, loc);
            let location = Object.assign(this.state.userLocation);
            location.latitude = loc.coords.latitude;
            location.longitude = loc.coords.longitude;
            location.timestamp = loc.timestamp
            this.setState({ userLocation: location, region: location });
            this.props.navigation.state.params.user.location = location;
            this.props.navigation.state.params.user.save();
        }, err => {
            Platform.OS === "android" ? ToastAndroid.showWithGravity("Could not get your location! \r\n" + err.message, ToastAndroid.LONG, ToastAndroid.CENTER) : Toast.show({ text: "Could not get your location! \r\n" + err.message, type: "danger", position: "bottom" });
            console.log(err);
        }, { enableHighAccuracy: true });
    }

    render() {
        return (
            <Root style={styles.container}>
                <MapView ref={ref => { this.mapRef = ref; }} showsCompass={true} onMapReady={this.onMapReady.bind(this)} loadingEnabled={true} followsUserLocation={this.state.followUser} provider={"google"} showsUserLocation={true} onUserLocationChange={this.onUserLocationChange.bind(this)} region={this.state.region} style={styles.map} initialRegion={this.initialRegion} >
                    {/* {this.state.vehicles.length > 1 ? <Marker title={this.state.vehicles[0].title} coordinate={{ latitudeDelta: this.state.vehicles[0].location.latitudeDelta, longitudeDelta: this.state.vehicles[0].location.longitudeDelta, longitude: this.state.userLocation.longitude, latitude: this.state.userLocation.latitude }} description={this.state.vehicles[0].brand + " " + this.state.vehicles[0].model + " (" + this.state.vehicles[0].type + "), " + this.state.vehicles[0].year} /> : null} */}
                    <Circle fillColor={'#a112'} zIndex={18} radius={25} center={{ latitude: this.state.userLocation.latitude, longitude: this.state.userLocation.longitude }} />
                    {this.state.vehicles ? this.state.vehicles.map((vehicle) => {
                        <Marker key={vehicle.id} title={vehicle.title} coordinate={{ latitudeDelta: vehicle.location.latitudeDelta, longitudeDelta: vehicle.location.longitudeDelta, longitude: vehicle.location.longitude, latitude: vehicle.location.latitude }} description={vehicle.brand + " " + vehicle.model + " (" + vehicle.type + "), " + vehicle.year} />
                    }) : null}
                </MapView>
                {/* <View style={styles.widgets} > */}
                <Omnibar listVehicles={() => this.setState({ listDialog: true })} addVehicle={() => { this.setState({ carDialog: true }) }} style={styles.widgets} setCoordinate={this._setCoordinate.bind(this)} ref={(ref) => { this.barRef = ref }} logout={this.props.navigation.replace.bind(this)} user={this.props.navigation.state.params.user} local={this.state.local} cars={this.state.vehicles} ownCars />
                {/* </View> */}
                {this.state.carDialog ?
                    (<AddCarDialog local={this.state.local} user={this.props.navigation.state.params.user} successCallback={() => { this.getVehicles() }} showModal={this.state.carDialog} closeDialog={() => this.setState({ carDialog: false })} />)
                    : null}
                {this.state.listDialog ?
                    (<ListCarDialog local={this.state.local} vehicles={this.state.vehicles} user={this.props.navigation.state.params.user} successCallback={() => { this.getVehicles() }} showModal={this.state.listDialog} closeDialog={() => this.setState({ listDialog: false })} />)
                    : null}
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

    _setCoordinate(location) {
        this.mapRef.animateToCoordinate(location, 500);
    }

    showProfile() {
        return (
            <View flex={1} justifyContent={'center'} alignContent={'center'} alignItems={'center'} backgroundColor={'#fff0'} >
                <View alignContent={'center'} justifyContent={'center'} style={{ margin: 20, padding: 10, borderRadius: 50 }} backgroundColor={'#fff'} >
                    <Image source={this.props.navigation.state.params.user.profileSrc} />
                </View>
            </View>
        )
    }

    onRouteChange(newRoute) {

    }

    onUserLocationChange(newLocation) {
        console.log(newLocation);

        let loc = new Location(newLocation.longitude, newLocation.latitude);
        loc.longitudeDelta = this.state.userLocation.longitudeDelta;
        loc.latitudeDelta = this.state.userLocation.latitudeDelta;
        this.setState({ userLocation: loc, region: loc });
        this.props.navigation.state.params.user.location = loc;
        this.props.navigation.state.params.user.save();
    }

    onMapReady(region) {
        this.getVehicles();
    }

    getVehicles() {
        try {
            this.state.local.getVehicles((veh, err) => {
                if (err) {
                    throw err;
                }
                this.setState({ vehicles: veh });
            }).catch(error => { Alert.alert("Error occurred", err.message); });
        } catch (err) {
            Alert.alert("Error occurred", err.message);
        }
    }

}



const margin = 18;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0ff',
        alignItems: 'center',
    },
    map: {
        backgroundColor: "#fff",
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1
    },
    widgets: {
        // height: 50,
        backgroundColor: "#0000",
        margin: margin,
        padding: 0,
        borderRadius: 10,
        position: 'absolute',
        top: (StatusBar.currentHeight + margin),
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 12
    }
});
