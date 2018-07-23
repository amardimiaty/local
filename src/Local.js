import { Location } from "./Route";

export default class Local {
    WEBAPP_URL = "http://192.168.56.1:8000/local.php"

    buildRequest(method, what, data, callback) {
        if (!what) {
            throw Error("No argument was provided!")
        }
        let url = this.WEBAPP_URL + "?r=" + what;
        if (data && method === "get") {
            url.concat("&data=" + data);
        }
        // Build subsequest query parts
        console.log(url)
        fetch(url, {
            body: data && method !== "get" ? data : null,
            keepalive: true,
            credentials: "include",
            mode: "navigate",
            method: method || "get"
        }).
            then((response) => {
                if (!response.ok && response.status > 299) {
                    throw new Error("Error performing your request!");
                }
                return response.json()
            }).then(result => {
                if (result.error) {
                    let err = new Error(result.error);
                    err.code = result.errno;
                    throw err;
                } else if (result.message.toLowerCase() === 'successful') {
                    return callback(result.data);
                }
            }).catch((err) => {
                throw new Error(err);
            })
    }

    showVehicles() {

    }

    getUser(id) {
        fetch()
    }

    addUser(user) {
        this.buildRequest("post", "adduser", JSON.stringify(user));
    }

    loginUser(user) {
        this.buildRequest('post', 'loginuser', JSON.stringify(user));
    }

    getVehicles(callback) {
        this.buildRequest('get', 'getvehicles', undefined, (res) => {
            cars = res.map(val => {
                let car = new Vehicle(val.id, new Location(parseFloat(val.longitude), parseFloat(val.latitude)));
                car.brand = val.brand;
                car.color = val.color;
                car.model = val.model;
                car.type = val.type;
                car.vid = val.vid;
                car.year = val.year;
                car.profile = val.profile;
                return car;
            })
            callback(cars);
        });
    }

    getVehiclesForUser(user) {
        return this.buildRequest('get', 'getvehicles', JSON.stringify({ username: user.username }));
    }

    getVehicleLocation(vehicle) {
        return this.buildRequest('get', 'getvehiclelocation', JSON.stringify({ vehicle: vehicle.vid }));
    }

    setVehicleLocation(vehicle, location) {
        return this.buildRequest('post', 'setvehiclelocation', JSON.stringify({ vehicle: vehicle.vid, longitude: location.longitude, latitude: location.latitude }));
    }
}

local = new Local();

export function mockVehicles() {

}



export class Vehicle {
    model = null
    brand = null
    year = 0
    vid = null
    color = null
    type = null
    profile = null

    constructor(id, location) {
        this.id = id
        this.location = location
    }
}

export class User {
    username = null
    location = null
    id = -1
    vehicles = []
    profile = null

    constructor(id, username, password) {
        this.id = id
        this.username = username
    }



}

export function SET_VEHICLE_LOCATION(vehicle, location) { }