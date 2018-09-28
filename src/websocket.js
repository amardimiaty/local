import { Toast } from 'native-base';


export const TYPES = {
    UPDATE_VEHICLE_LOCATION: 'update.vehicle.location',
    UPDATE_CREDENTIALS: 'update.credentials',
    USER_AUTHENTICATE: 'user.authenticate',
    USER_ACTIVE_LIST: 'user.active.list',
    USER_ACTIVE_CHANGE: 'user.active.change',
    SYSTEM: 'SYSTEM'
};

export const STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline'
}

export default class WebSock {

    AUTH_TOKEN = null;
    session = null;
    localSession = null;
    activeUsers = [];

    constructor(url, token = null) {
        this.localSession = token;
        try {
            let s = new WebSocket(url);
            s.onopen = () => {
                this.send({ token });
            };
            s.onclose = () => {
                Toast.show({ text: 'Socket connection lost... you on your own now!', type: 'warning', position: 'bottom' });
            }
            s.onmessage = (m) => {
                message = JSON.parse(m);
                if (message) {
                    onmessage.call(this, message.type, message.data);
                }
            }
            this.socket = socket;
        } catch (err) {
            console.log('Could not start WebSocket!');
            Toast.show({ text: err.message, type: 'danger', position: 'bottom' });
        }
    }

    send(message) {
        this.socket.send(JSON.stringify(message));
    }

    updateVehicle(vehicleLcation) {
        if (vehicleLcation) {
            this.send({ type: STATUS, data: {} })
        }
    }
}

function onmessage(type, message) {
    switch (type) {
        case TYPES.USER_AUTHENTICATE:
            this.AUTH_TOKEN = message.token;
            delete message.token;
            this.session = message;
            console.log(this.session);
            this.send({ type: TYPES.USER_ACTIVE_LIST });
            break;
        case TYPES.UPDATE_CREDENTIALS:
            Toast.show({ text: message, type: 'warning', position: 'bottom' });
            this.send({ type: TYPES.USER_AUTHENTICATE, token: this.localSession });
            break;
        case TYPES.UPDATE_VEHICLE_LOCATION:
            if (this.onvehicleupdate) {
                this.onvehicleupdate(message);
            } else {
                Toast.show({ text: "Vehicle " + message.vid + " location updated!", type: 'success', position: 'bottom' });
            }
            break;
        case TYPES.USER_ACTIVE_LIST:
            if (Array.isArray(message)) {
                this.activeUsers = message;
            }
            break;
        case TYPES.USER_ACTIVE_CHANGE:
            if (message.username) {
                if (message.status === STATUS.OFFLINE && this.activeUsers.includes(message.username)) {
                    this.activeUsers = this.activeUsers.filter((v, i) => v !== message.username);
                } else if (message.status === STATUS.ONLINE) {
                    if (!this.activeUsers.includes(message.username)) {
                        this.activeUsers.push(message.username);
                    }
                }
            }
            break;
        case TYPES.SYSTEM:
            Toast.show({ text: message, type: 'danger', position: 'bottom' });
            break;

    }
}