import { AsyncStorage } from "react-native"

export default class Route {


    point = { x: 0, y: 0 }

    constructor(id) {
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
    latitude = 0
    longitude = 0
    longitudeDelta = 0
    latitudeDelta = 0
    longitudeDelta = 0
}