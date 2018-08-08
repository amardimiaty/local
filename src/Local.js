import { Location } from "./Route";

export default class Local {
    WEBAPP_URL = "http://192.168.56.1:8000";
    WEBSOCK_URL = "ws:192.168.56.1:8080";

    constructor(config) {
        this.webAppUrl = config.WEBAPP_URL || this.WEBAPP_URL;
        this.webSocketUrl = config.WEBSOCK_URL || this.WEBSOCK_URL;
    }

    setWebAppUrl(url){
        this.webAppUrl = 'http://'+url;
    }

    setWebSockUrl(url){
        this.webSocketUrl = 'ws:'+url;
    }

    buildRequest(method, what, data, callback) {
        if (!what) {
            throw Error("No resource argument was provided!")
        }
        let url = this.webAppUrl + what;
        if (data && method === "get") {
            url.concat("data=" + data);
        }
        // Build subsequest query parts
        console.log("Fetch from " + url);
        fetch(url, {
            body: data && method !== "get" ? data : null,
            keepalive: true,
            credentials: "include",
            mode: "navigate",
            method: method || "get"
        }).then((response) => {
            if (!response.ok && response.status > 299) {
                return new Promise((res,rej)=>{
                    rej(new Error("Error performing your request!"));
                });
            }
            return response.json()
        }).then(result => {
            if (result.error) {
                let err = new Error(result.error.join('. '));
                err.code = result.errno;
                return new Promise((res,rej)=>{
                    rej(err);
                });
            } else if (result.message.toLowerCase() === 'successful') {
                return callback(result.data);
            }
        }).catch((err) => {
            console.log(err);
            throw new Error(err);
        })
    }

    showVehicles() {

    }

    getUser(id) {
        fetch()
    }

    addUser(user, callback) {
        this.buildRequest("post", "/user/add", JSON.stringify(user), (data) => {
            let user = new User(data.username);
            user.profile = profile;
            callback(user);
        });
    }

    loginUser(user, callback) {
        this.buildRequest('post', '/user/login', JSON.stringify(user), res => {
            let user = new User(res.username);
            user.profile = profile;
            return callback(user);
        });
    }

    getVehicles(callback) {
        return this.buildRequest('get', '/vehicle', undefined, (res) => {
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

    getVehiclesForUser(username, callback) {
        return this.buildRequest('get', '/vehicle/' + username, undefined, res => {
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
            callback(cars)
        });
    }

    getVehicleLocation(vehicleId, callback) {
        if (vehicleId instanceof Array) {
            return this.buildRequest('post', '/location/', JSON.stringify({ 'vehicle': vehicleId }), res => {
                let locationMap = {};
                res.forEach(val => {
                    let location = new Location(val.longitude, val.latitude);
                    location.timestamp = val.timestamp;
                    locationMap[res.vehicle] = location;
                });
                callback(locationMap);
            });
        } else {
            return this.buildRequest('get', '/location/' + vehicleId, undefined, res => {
                let val = res[0]; // Since result is for a single vehicle, get that vehicle location
                let location = new Location(val.longitude, val.latitude);
                location.timestamp = val.timestamp;
                callback(location);
            });
        }
    }

    setVehicleLocation(vehicle, location, callback) {
        return this.buildRequest('post', '/location/' + vehicle.vid, JSON.stringify({ vehicle: vehicle.vid, longitude: location.longitude, latitude: location.latitude }));
    }
}

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

    constructor(username) {
        this.username = username
    }



}

export function SET_VEHICLE_LOCATION(vehicle, location) { }