import { AsyncStorage, ToastAndroid, Platform } from 'react-native';
import { Toast } from 'native-base';
import fBase from 'firebase';

import { Location } from "./Route";

export const DEBUG = true;

/**
 * 
 *  Values stored in the database include: web,user.
 * 
 *      web contains necessary app-specific information.
 *      user contains user-specific information.
 * 
 */
export default class Local {
    WEBAPP_URL = "http://192.168.56.1:8000";
    WEBSOCK_URL = "ws://192.168.56.1:8080";
    AUTH_TOKEN = null;
    static PowerSaver = ['OFF', 'LOW', 'HIGH'];

    REGEX = new RegExp(/^(http|https):\/\/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|[A-Za-z0-9^\\s]{2,}):[0-9]{1,}.*/i);
    REGEX2 = new RegExp(/^(ws|wss|http|https):\/\/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|[A-Za-z0-9^\\s]{2,}):[0-9]{1,}.*/i);
    get isSetup() {
        let setup = this.webAppUrl !== undefined && this.REGEX.test(this.webAppUrl);
        console.log("is setup: ", this.webAppUrl !== undefined, this.REGEX.test(this.webAppUrl), this.webAppUrl);
        return setup;
    }

    set useWebSock(use) {
        this.config.USE_WEBSOCK = use;
    }
    get useWebSock() {
        return this.config.USE_WEBSOCK;
    }

    set powerSaver(pS) {
        this.config.POWERSAVER = pS;
    }

    constructor(config) {
        this.config = config;
        this.setWebAppUrl(config.WEBAPP_URL || this.WEBAPP_URL);
        this.setWebSockUrl(config.WEBSOCK_URL || this.WEBSOCK_URL);
    }

    setWebAppUrl(url) {
        if (this.REGEX.test("http://" + url)) {
            this.webAppUrl = 'http://' + url;
        } else if (this.REGEX.test(url)) {
            this.webAppUrl = url;
        } else {
            return false
        }
        this.config.WEBAPP_URL = this.webAppUrl;
        return true;
    }

    setWebSockUrl(url) {
        if (this.REGEX2.test("ws://" + url)) {
            this.webSocketUrl = 'ws://' + url; //TODO: correct this!!!!! -- DONE!!!!!
        } else if (this.REGEX2.test(url)) {
            this.webSocketUrl = url;
        } else {
            return false;
        }
        this.config.WEBSOCK_URL = this.webSocketUrl;
        return true;
    }

    async buildRequest(method, what, data, callback, timeout = 15000, authenticated = false) {
        if (!what) {
            throw Error("No resource argument was provided!")
        }
        let url = this.webAppUrl + what;
        if (data && method === "get") {
            url.concat("data=" + data);
        }
        // TODO: Build subsequest query parts
        console.log("Fetch from " + url);
        // let controller = new AbortController();
        // let signal = controller.signal;
        // signal.onabort = (s, e) => {
        //     consoe.log(s, e);
        //     return callback(null, new Error('Request aborted'));
        // }

        try {
            let response = await this.fetch(url, data, method, timeout, authenticated);
            console.log(response);
            if(!response){
                throw new Error('Network request failed');
            }

            if (!response.ok && response.status > 299) {
                throw new Error("Error performing your request!");
            }
            if (response.headers.has('X-Auth')) {
                this.AUTH_TOKEN = response.headers.get('X-Auth').trim();
            }

            let result = await response.json()
            console.log(result);
            if (!result) {
                return callback();
            }
            if (result.error) {
                let err = new Error(result.error.join('. '));
                err.code = result.errno;
                return callback(null, err);
            } else if (result.message.toLowerCase() === 'successful') {
                return callback(result.data);
            }
            // }, err => {
            //     console.log("Resource fetch error", err);

            //     // throw new Error(err);
            //     return callback(null, err);
            // })
        } catch (err) {
            callback(null, err);
        }
    }

    fetch(url, data, method, timeout, authenticated = false) {
        return new Promise((res, rej) => {
            fetch(url, {
                body: data && method !== "get" ? data : null,
                keepalive: true,
                credentials: "include",
                mode: "navigate",
                redirect: "follow",
                method: method || "get",
                // signal: signal,
                headers: authenticated ? ['X-Auth']['Bearer '.concat(this.AUTH_TOKEN)] : null
            }).then(res).catch(rej);
            if (timeout !== undefined && typeof timeout === 'number') {
                setTimeout((rej), timeout, new Error('Connection timed out!'));
            }
        });
    }

    showVehicles() {

    }

    getUser(id) {
        fetch()
    }

    addUser(user, callback) {
        return this.buildRequest("post", "/user/add", JSON.stringify(user), (data, err) => {
            if (err) {
                throw err;
            }
            if (data) {
                let user = new User(data.username);
                user.profile = data.profile;
                user.token = this.AUTH_TOKEN;
                if (!DEBUG) {
                    this.getWebSocketUrl();
                }
                callback(user);
            }
        });
    }

    loginUser(user, callback) {
        return this.buildRequest('post', '/user/login', JSON.stringify(user), (res, err) => {
            if (err) {
                // throw err;
                console.log(err)
                return callback(null, err);
            }
            if (res) {
                let user = new User(res.username);
                user.profile = res.profile;
                user.token = this.AUTH_TOKEN;
                if (!DEBUG) {
                    this.getWebSocketUrl();
                }
                return callback(user);
            }
            return callback(null, new Error("Server not responding"));
        }).then(null, error => callback(null, error));
    }

    loginWithToken(token, callback) {
        this.buildRequest('post', '/user/login_token', JSON.stringify(token), (res, err) => {
            return callback(this.AUTH_TOKEN, err);
        });
    }

    getVehicles(callback) {
        return this.buildRequest('get', '/vehicle', undefined, (res, err) => {
            if (err) {
                throw err;
            }
            if (res) {
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
            }
            // console.log(cars);
            callback(cars, err);
        });
    }

    getVehiclesForUser(username, callback) {
        return this.buildRequest('get', '/vehicle/' + username, undefined, (res, err) => {
            if (err) {
                throw err;
            }
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
            callback(cars, err)
        });
    }

    getVehicleLocation(vehicleId, callback) {
        if (vehicleId instanceof Array) {
            return this.buildRequest('post', '/location/', JSON.stringify({ 'vehicle': vehicleId }), (res, err) => {
                if (err) {
                    throw err;
                }
                let locationMap = {};
                res.forEach(val => {
                    let location = new Location(val.longitude, val.latitude);
                    location.timestamp = val.timestamp;
                    locationMap[res.vehicle] = location;
                });
                callback(locationMap, err);
            });
        } else {
            return this.buildRequest('get', '/location/' + vehicleId, undefined, (res, err) => {
                if (err) {
                    throw err;
                }
                let val = res[0]; // Since result is for a single vehicle, get that vehicle location
                let location = new Location(val.longitude, val.latitude);
                location.timestamp = val.timestamp;
                callback(location, err);
            });
        }
    }

    setVehicleLocation(vehicle, location, callback) {
        return this.buildRequest('post', '/location/' + vehicle.vid, JSON.stringify({ vehicle: vehicle.vid, longitude: location.longitude, latitude: location.latitude }), (res, err) => {
            if (err) {
                return err;
            }
            callback(res, err);
        });
    }

    logout(callback) {
        this.buildRequest('get', '/user/logout', null, res => {
            this.AUTH_TOKEN = null;
            return callback();
        });
    }

    getWebSocketUrl(cb) {
        let result = false;
        try {
            fetch(this.webAppUrl + '/config/websock', {
                keepalive: true,
                credentials: "include",
                mode: "navigate",
                redirect: "follow",
                method: "GET",
            })
                .then(response => { console.log(response); return response.json() })
                .then(json => {
                    console.log(json);
                    if (json.error) {
                        throw new Error(json.error);
                    }
                    if (json && json.data.url) {
                        Local.toast('WebSocket url is: ' + json.data.url, { type: 'success' })
                        result = json.data.url;
                        cb(result);
                    }
                }).catch(err => {
                    Local.toast(err.message, { type: 'danger' });
                    cb(null, err);
                });
        } catch (err) {
            Toast.show(err.message, { type: 'danger' });
            cb(null, err);
        };
    }

    static toast(message, options = { type: 'info', duration: ToastAndroid.SHORT, position: 'center' }) {
        if (Platform.OS === "android") {
            let position;
            switch (options.position || 'center') {
                case 'bottom':
                    position = ToastAndroid.BOTTOM;
                    break;
                case 'center':
                    position = ToastAndroid.CENTER;
                    break;
                case 'top':
                    position = ToastAndroid.TOP;
                    break;
            }
            ToastAndroid.showWithGravity(message, options.duration || ToastAndroid.SHORT, position);
        } else {
            Toast.show({ text: message, type: options.type || 'info', position: options.position || 'center' });
        }
    }
}


export function debounce(func, duration = 250, immediate = false) {
    let timeout;
    return function () {
        let context = this, args = arguments;
        let later = function () {
            console.log(context);
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        let callnow = immediate && !timeout
        clearTimeout(timeout);
        timeout = setTimeout(later, duration);
        if (callnow) func.apply(context, args);
    }

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
    isactive = false;
    username = null
    location = null
    id = -1
    vehicles = []
    profile = null
    token = null;
    get profileSrc() {
        return "data:image/png;base64," + this.profile;
    }

    constructor(username) {
        if (username && typeof username === 'object') {
            this.username = username.name;
            this.location = username.location;
            this.id = username.id;
            this.vehicles = username.vehicles;
            this.profile = username.profile;
            this.token = username.token;
        } else {
            this.username = username
        }
    }

    login(user) {
        this.username = user.username;
        this.profile = user.profile;
        this.location = user.location;
        this.useFingerprint = user.useFingerprint;
        this.vehicles = null;
        this.token = user.token;
    }

    save(token) {
        if (token) {
            this.token = token;
        }
        AsyncStorage.setItem('user', JSON.stringify(this), err => {
            if (err) {
                console.log(err)
            }
        });
    }

}

export function SET_VEHICLE_LOCATION(vehicle, location) { }