import { AsyncStorage, Dimensions } from "react-native"

export default class Route {


    point = { x: 0, y: 0 }

    constructor(id = null) {
        this.id = id
    }

    get(id) {
        if (id) {
            return AsyncStorage.getItem(id).then((route) => JSON.parse(route), () => null);
        }
    }

    save() {
        AsyncStorage.setItem(this.id, JSON.stringify(this))
    }
}

export class Location {
    latitude = 0;
    longitude = 0;
    longitudeDelta = 11.5;

    latitudeDelta = 0.0922;

    timestamp = Date.now();

    constructor(longitude, latitude) {
        this.longitude = longitude || 0;
        this.latitude = latitude || 0;
        let { width, height } = Dimensions.get('window');
        this.longitudeDelta = this.latitudeDelta * (width / height);
    }

    update(longitude, latitude) {
        this.longitude = longitude;
        this.latitude = latitude;
    }
}

export class Point {
    x = 0
    y = 0
}