import { AsyncStorage,Dimensions } from "react-native"
import { Point as p, Region } from "react-native-maps";

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
    get longitudeDelta (){
        let {width,height} = Dimensions.get('window');
        return this.latitudeDelta * (width/height);
    };
    latitudeDelta = 0.0922;

    timestamp = Date.now();

    constructor(longitude, latitude) {
        this.longitude = longitude || 0;
        this.latitude = latitude || 0;
    }
}

export class Point {
    x = 0
    y = 0
}