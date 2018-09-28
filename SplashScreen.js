import React, { Component } from 'react';
import { View, Text, Icon, Button, Input, Toast, Root, Item, CheckBox, Switch, Label } from 'native-base';
import { Slider, StatusBar, AsyncStorage, Alert, ToastAndroid, Modal, ScrollView, StyleSheet, BackPressEventName, ActivityIndicator, Vibration, BackHandler, Platform } from 'react-native';
import Expo, { Fingerprint } from 'expo';
import Local, { User, debounce } from './src/Local';
import { version } from './App';

export default class Splash extends Component {

    static navigationOptions = { header: null }
    state = {
        useFingerprint: true,
        settingsLoaded: false,
        useWebsockets: true,
        webappUrl: '', websockUrl: '',
        showOptions: false, powerSaver: 0,
        showLogin: false, showRegister: false,
        username: null, loginPass: null, regPass: null, regPassVerify: null,
        loadedFont: false, hasFingerprint: false,
        getFingerPrint: false,
        showIndicator: false, loggedIn: false
    }
    running = true;// used to stop background tasks after component unmount.
    timeout = 0;

    constructor(props) {
        super(props)
        Expo.Font.loadAsync({
            'Roboto': require('native-base/Fonts/Roboto.ttf'),
            'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
        }).then(() => {
            this.setState({ loadedFont: true });
        });

        this.state.hasFingerprint = Fingerprint.hasHardwareAsync() && Fingerprint.isEnrolledAsync();
        StatusBar.setHidden(true);

        AsyncStorage.getItem('web.config', (err, res) => {
            if (err) {
                console.error(err);
            }
            console.log(res);
            if (!this.running) {
                return;
            }
            if (res) {
                let webConfig = JSON.parse(res);
                this.local = new Local(webConfig);
                this.setState({ webappUrl: webConfig.WEBAPP_URL, websockUrl: webConfig.WEBSOCK_URL, useWebsockets: webConfig.USE_WEBSOCK, powerSaver: webConfig.POWERSAVER });
            } else {
                this.local = new Local({});
            }
        }).then(() => {
            return AsyncStorage.getItem('user')
        }).then(res => {
            if (!this.running) {
                return;
            }
            this.user = new User(JSON.parse(res));
            this.setState({ username: this.user.username });

            if (this.local.isSetup && this.user.token) {
                this.local.loginWithToken({ token: this.user.token }, (newToken, err) => {
                    this.setState({ settingsLoaded: false });
                    if (err) {
                        Vibration.vibrate(1000);
                        Platform.OS === "android" ? ToastAndroid.showWithGravity(err.message || "Your session has expired!", ToastAndroid.LONG, ToastAndroid.BOTTOM) : Toast.show({ text: "Your session has expired!", type: 'danger', position: 'bottom' });
                        this.user.token = null;
                        this.local.AUTH_TOKEN = null;
                        this.setState({ settingsLoaded: true });
                        return;
                    }
                    this.user.token = newToken;
                    this.setState({ showLogin: false, settingsLoaded: false, loggedIn: true });
                    this.startApp({
                        user: this.user,
                        local: this.local
                    });
                })
            } else {
                this.setState({ settingsLoaded: true });
            }
        }).catch(err => { console.log(err) });

        this._saveOptions = debounce(() => {
            AsyncStorage.setItem('web.config', JSON.stringify(this.local.config), (err) => {
                if (err) {
                    console.log(err);
                }
            })
        }, 1000).bind(this);

        BackHandler.addEventListener(BackPressEventName, () => {
            console.log("back button pressed");
            if (this.state.showLogin) {
                this.resetModal()
                return true;
            }
        });
    }

    componentDidMount() {
        console.log(this.local, 444)
        this.timeoutID = setTimeout(() => {
            StatusBar.setHidden(false);
            StatusBar.setTranslucent(true);
        }, 7000);
    }

    startApp(params) {
        this.user.save();
        this.local
        setTimeout(() => {
            this.props.navigation.replace("Home", params);
        }, 100);
    }

    componentWillUnmount() {
        this.resetModal();
        this.running = false;
        clearTimeout(this.timeoutID);
    }

    resetModal() {
        if (this.running) {
            this.setState({ showLogin: false });
        }
    }

    registerUser() {
        if (!this.local.isSetup) {
            Vibration.vibrate(500);
            Alert.alert("Application not setup!", "You must set the web application url before using this app.", [{ style: 'destructive', text: 'Maybe Later' }, { style: 'default', text: 'Setup Now', onPress: () => { this.setState({ showOptions: true }) } }], { cancelable: false });
            return false;
        }
        if (!this.state.username || !this.state.username.trim() || !this.state.regPass || !this.state.regPassVerify) {
            Vibration.vibrate(500);
            Platform.OS === "android" ? ToastAndroid.showWithGravity("Ensure that no field is empty!", ToastAndroid.SHORT, ToastAndroid.BOTTOM) : Toast.show({ text: "Ensure that no field is empty!", type: 'danger', position: 'bottom' });
            return;
        }
        try {
            this.setState({ showIndicator: true });
            this.local.addUser({ username: this.state.username, password: this.state.regPass, v_password: this.state.regPassVerify }, (user, er) => {
                if (er) {
                    throw er;
                }
                this.user.login(user);
                this.setState({ showIndicator: false, showLogin: false, settingsLoaded: false, loggedIn: true });
                this.startApp({ user: this.user, local: this.local });
            }).catch(error => {
                Vibration.vibrate(1000);
                Alert.alert('Registration Error!', error.message);
                this.setState({ showIndicator: false });
            });
        } catch (err) {
            Vibration.vibrate(1000);
            Alert.alert('Registration Error!', err.message);
            console.log(err);
            this.setState({ showIndicator: false });
        }
    }

    loginUser() {
        if (!this.local.isSetup) {
            Vibration.vibrate(500);
            this.setState({ showIndicator: false });
            Alert.alert("Application not setup!", "You must set the web application url before using this app.", [{ style: 'destructive', text: 'Maybe Later' }, { style: 'default', text: 'Setup Now', onPress: () => { this.setState({ showOptions: true }) } }], { cancelable: false });
            return false;
        }
        if (!this.state.username || !this.state.username.trim() || !this.state.loginPass) {
            Vibration.vibrate(500);
            Platform.OS === "android" ? ToastAndroid.showWithGravity("Ensure that no field is empty!", ToastAndroid.SHORT, ToastAndroid.BOTTOM) : Toast.show({ text: "Ensure that no field is empty!", type: 'danger', position: 'bottom' });
            return;
        }
        try {
            this.setState({ showIndicator: true });
            this.local.loginUser({ username: this.state.username, password: this.state.loginPass }, (user, er) => {
                if (er) {
                    throw er;
                }
                this.user.login(user);
                this.setState({ showIndicator: false, showLogin: false, settingsLoaded: false, loggedIn: true });
                this.startApp({ user: user, local: this.local });
            }).catch(error => {
                Vibration.vibrate(1000);
                this.setState({ showIndicator: false });
                Alert.alert('Login Error!', error.message);
            });
        } catch (err) {
            Vibration.vibrate(1000);
            this.setState({ showIndicator: false });
            Alert.alert('Login Error!', err.message);
        }
    }

    async fingerPrint() {

        let resp = await Fingerprint.authenticateAsync("Authenticate with FaceId or Fingerprint");
        // timeout = setTimeout(() => { Fingerprint.cancelAuthenticate() }, 10000);
        if (resp.success) {
            this.setState({ showIndicator: true });
            this.local.loginWithToken({ token: this.user.token }, (newToken, err) => {
                this.setState({ showIndicator: false });
                if (err) {
                    Vibration.vibrate(1000);
                    Alert.alert('Login Failed!', err.message);
                    this.user.token = null;
                    this.local.AUTH_TOKEN = null;
                    this.setState({ useFingerprint: false })
                    return;
                }
                this.user.token = newToken;
                this.setState({ showLogin: false, settingsLoaded: false, loggedIn: true });
                this.startApp({
                    user: this.user,
                    local: this.local
                });
            })
        } else {
            Alert.alert('Authentication Failed!', resp.message || "Could not identify user.");
            console.info(resp);
        }
        this.setState({ getFingerPrint: false });
        // clearTimeout(this.timeout);

    }

    getFingerPrint() {
        return Platform.OS === "android" ? <Text style={{ color: '#252', fontSize: 12, marginBottom: 5 }}>Place your finger over the touch sensor.</Text> : <Text style={{ color: '#252', fontSize: 12, marginBottom: 5 }}>scanning...</Text>;
    }


    render() {
        /* Do note that nesting registration condition within login condition may be a bad idea... Well!!!!!*/
        return (
            <Root flex={1}>
                <View flex={1} alignItems={"center"} style={{ backgroundColor: "#002" }} justifyContent={'center'}>

                    <Icon name={'person'} style={[{ position: 'absolute', top: 10, left: 20 }, Platform.select({ android: { top: StatusBar.currentHeight + 10 } }), { fontSize: 20, color: this.state.loggedIn ? '#0f0a' : "#f00b" }]} />

                    {this.state.settingsLoaded ?
                        <Button rounded bordered icon style={[{ borderColor: '#fff', position: 'absolute', top: 10, right: 10 }, Platform.select({ android: { top: StatusBar.currentHeight + 10 } })]} onPress={() => { this.setState({ showOptions: true }) }} >
                            <Icon name={'settings'} style={{ color: '#fff' }} />
                        </Button>
                        : null}
                    <Icon name={'map'} style={{ color: "#fff", fontSize: 50 }} />
                    <View>
                        <Text style={{ textAlign: 'center', fontSize: 30, color: "#fff" }} >
                            Local
                        </Text>
                        <Text style={{ textAlign: 'center', fontSize: 13, color: "#bbb" }} >Version {version}</Text>
                    </View>
                    {this.state.loadedFont && this.state.settingsLoaded ?
                        <Button style={{ marginTop: 20, marginLeft: 25, marginRight: 25 }} disabled={false} light rounded block onPress={() => { this.setState({ showLogin: true }) }}>
                            <Icon name="log-in" /><Text style={{ textAlign: 'center', color: "#000" }} >Login or Register</Text>
                        </Button>
                        :
                        <ActivityIndicator size={'large'} marginTop={10} color={this.state.loggedIn ? '#5f5' : '#fffb'} />
                    }
                    <Text style={{ textAlign: 'center', color: '#aaa', fontSize: 13, position: 'absolute', bottom: 20, left: 0, right: 0 }} >&copy; 2018 Agwa Israel Onome</Text>

                    {/* {this.state.showLogin ? */}
                    <Modal visible={this.state.showLogin} onRequestClose={() => { }} transparent={true} animationType={'slide'} >
                        <View flex={1} justifyContent={'center'} alignContent={'stretch'} backgroundColor={'#0008'} >
                            {this.state.showRegister ?
                                <View alignItems={"stretch"} alignContent={'center'} style={{ padding: 25, margin: 30, borderRadius: 15, paddingTop: 30 }} backgroundColor={"#ddd"} justifyContent={"center"} >
                                    <Item style={{ borderBottomWidth: 0 }} >
                                        <Icon name={'body'} />
                                        <Input maxHeight={50} label='Username' underlineColorAndroid={'transparent'} style={styles.input} onChangeText={(t) => { this.setState({ username: t.trim() }) }} placeholder={"enter Username"} value={this.state.username} />
                                    </Item>
                                    <Item style={{ borderBottomWidth: 0 }} >
                                        <Icon name={'lock'} />
                                        <Input maxHeight={50} label='Password' underlineColorAndroid={'transparent'} style={styles.input} onChangeText={(t) => { this.setState({ regPass: t }) }} secureTextEntry={true} placeholder={"enter Password"} value={this.state.regPass} />
                                    </Item>
                                    <Item style={{ borderBottomWidth: 0 }} >
                                        <Icon name={'lock'} />
                                        <Input maxHeight={50} label='Verify Password' underlineColorAndroid={'transparent'} style={styles.input} onChangeText={(t) => { this.setState({ regPassVerify: t }) }} secureTextEntry={true} placeholder={"verify Password"} value={this.state.regPassVerify} />
                                    </Item>
                                    <Text onPress={() => this.setState({ showRegister: false })} style={{ textAlign: 'center', padding: 4, fontSize: 18, fontWeight: 'bold', color: '#227' }} >Already have an account?</Text>
                                    <View flexDirection={'row-reverse'} alignContent={'stretch'} justifyContent={'space-between'} >
                                        <Button iconRight={true} icon rounded block success onPress={this.registerUser.bind(this)} >
                                            <Text>Register</Text><Icon name="person-add" />
                                        </Button>
                                        <Button rounded block danger onPress={this.resetModal.bind(this)} >
                                            <Icon name='close' />
                                        </Button>
                                    </View>
                                </View>
                                :
                                <View alignItems={"stretch"} alignContent={'center'} style={{ padding: 25, margin: 30, borderRadius: 15 }} backgroundColor={"#ddd"} justifyContent={"center"} >
                                    {this.user && this.user.token && this.state.useFingerprint ?
                                        <View flexDirection={'column'} justifyContent={'center'} alignContent={'center'} alignItems={'center'} >
                                            <Item style={{ borderBottomWidth: 0 }} >
                                                <Icon onPress={() => { { this.setState({ getFingerPrint: true }); } this.fingerPrint(); }} style={{ padding: 10, paddingBottom: 5, fontSize: 60 }} name={'finger-print'} />
                                            </Item>
                                            <Item style={{ borderBottomWidth: 0 }} >
                                                {this.state.getFingerPrint ?
                                                    this.getFingerPrint() :
                                                    <Text style={{ fontSize: 12, marginBottom: 5 }}>Click to {Platform.select({ android: "Use Fingerprint", ios: "Use TouchID or Fingerprint" })}</Text>
                                                }
                                            </Item>
                                        </View>
                                        : null}
                                    {!this.state.getFingerPrint ?
                                        <Item style={{ borderBottomWidth: 0 }} >
                                            <Icon name={'body'} />
                                            <Input maxHeight={50} underlineColorAndroid={'transparent'} style={styles.input} placeholder={"enter Username"} onChangeText={(t) => { this.setState({ username: t.trim() }) }} value={this.state.username} />
                                        </Item>
                                        : null}
                                    {!this.state.getFingerPrint ?
                                        <Item style={{ borderBottomWidth: 0 }} >
                                            <Icon name={'lock'} />
                                            <Input maxHeight={50} underlineColorAndroid={'transparent'} style={styles.input} secureTextEntry={true} onChangeText={(t) => { this.setState({ loginPass: t }) }} placeholder={"enter Password"} value={this.state.loginPass} />
                                        </Item>
                                        : null}
                                    <Text onPress={() => this.setState({ showRegister: true })} style={{ textAlign: 'center', padding: 4, fontSize: 18, fontWeight: 'bold', color: '#227', marginTop: 5, marginBottom: 5 }} >Create a new account?</Text>
                                    <View flexDirection={'row-reverse'} alignContent={'stretch'} justifyContent={'space-between'} >
                                        <Button iconRight rounded block primary onPress={this.loginUser.bind(this)} >
                                            <Text>Login</Text><Icon name="log-in" />
                                        </Button>
                                        <Button rounded block danger onPress={this.resetModal.bind(this)} >
                                            <Icon name='close' />
                                        </Button>
                                    </View>
                                </View>
                            }
                        </View>
                    </Modal>
                    {/* : null} */}
                    <Modal visible={this.state.showOptions} onRequestClose={() => { }} transparent={true} animationType={'fade'} >
                        <View flex={1} justifyContent={'center'} backgroundColor={'#4447'} >
                            <View alignItems={"stretch"} alignContent={'space-between'} style={{ padding: 25, margin: 25, borderRadius: 15 }} backgroundColor={"#ddd"} justifyContent={"flex-start"} >
                                <Text style={styles.headerText} >Settings</Text>
                                <ScrollView>
                                    <Item style={{ borderBottomWidth: 0 }} >
                                        <Icon name={'globe'} />
                                        <Input padding={8} maxHeight={40} label='Server Url' underlineColorAndroid={'transparent'} style={[styles.input, { fontSize: 14, padding: 10, textAlign: 'center' }]} onChangeText={this.saveOptionsWebUrl.bind(this)} placeholder={"enter web server address"} value={this.state.webappUrl} />
                                    </Item>
                                    {this.state.useWebsockets ?
                                        <Item style={{ borderBottomWidth: 0 }} >
                                            <Icon name={'sync'} />
                                            <Input padding={8} maxHeight={40} label='Server Url' underlineColorAndroid={'transparent'} style={[styles.input, { fontSize: 14, padding: 10, textAlign: 'center' }]} onChangeText={this.saveOptionsWebSock.bind(this)} placeholder={"enter socket server address"} value={this.state.websockUrl} />
                                        </Item>
                                        : null}
                                    {this.state.useWebsockets ?
                                        <Button transparent bordered info block rounded style={{ margin: 6, borderColor: '#000', justifyContent: 'center', alignContent: 'stretch' }} onPress={() => { this.setState({ showIndicator: true }); this.local.getWebSocketUrl((url, err) => { if (url) { console.log(url); this.saveOptionsWebSock(url); } this.setState({ showIndicator: false }); }) }} >
                                            <Text style={{ color: '#111', fontSize: 13 }} >Fetch WebSocket Url</Text>
                                        </Button>
                                        : null}
                                    <Item underline={false} style={{ borderBottomWidth: 0, margin: 6, justifyContent: 'center', alignContent: 'stretch' }}  >
                                        <Label>Use WebSockets?</Label>
                                        <Switch value={this.state.useWebsockets} onValueChange={(t) => { this.setState({ useWebsockets: t }); if (t === this.local.useWebSock) { return; } this.local.useWebSock = t; console.log(t, this.local); this._saveOptions(); }} />
                                    </Item>
                                    {this.state.hasFingerprint ?
                                        <Item underline={false} style={{ borderBottomWidth: 0, margin: 6, justifyContent: 'center', alignContent: 'stretch' }}  >
                                            <Label ><Icon name={'finger-print'} style={{ fontSize: 20 }} /> &nbsp;&nbsp;Use Fingerprint?</Label>
                                            <Switch value={this.state.useFingerprint} onValueChange={(t) => { this.setState({ useFingerprint: t }); }} />
                                        </Item>
                                        : null}
                                    <Item stackedLabel underline={false} style={{ margin: 7, justifyContent: 'center', alignContent: 'stretch' }}  >
                                        <Label ><Icon name={'battery-full'} style={{ fontSize: 15 }} /> &nbsp;PowerSaver: {Local.PowerSaver[this.state.powerSaver]}</Label>
                                        <Slider style={{ margin: 6, marginTop: 19 }} alignSelf={'stretch'} maximumValue={2} minimumValue={0} step={1} value={0} onValueChange={v => { this.setState({ powerSaver: v }); this.local.powerSaver = v; console.log("Powersaver: " + Local.PowerSaver[v], v); this._saveOptions(); }} />
                                    </Item>
                                </ScrollView>
                                <Button style={styles.footerButton} icon block rounded danger onPress={buton => { this.setState({ showOptions: false }) }} >
                                    <Icon name={'close'} />
                                </Button>
                            </View>
                        </View>
                    </Modal>
                    <Modal visible={this.state.showIndicator} transparent={true} animationType={'slide'} onRequestClose={m => { return null }} >
                        <View flex={1} justifyContent={'center'} alignContent={'center'} alignItems={'center'} backgroundColor={'#fff8'} >
                            <View alignContent={'center'} justifyContent={'center'} style={{ margin: 20, padding: 10, borderRadius: 50 }} backgroundColor={'#fff'} >
                                <ActivityIndicator hidesWhenStopped={false} color={'#228'} size={'large'} />
                            </View>
                        </View>
                    </Modal>
                </View>
            </Root>
        )
    }

    saveOptionsWebUrl(t) {
        this.setState({ webappUrl: t });
        if (!t || (t.trim() === this.local.webAppUrl)) {
            console.info(t, 6);
            return;
        }
        if (this.local.setWebAppUrl(t.trim())) {
            this._saveOptions();
        }
        console.log(t, 0, this.local.webAppUrl, 911);
    }

    saveOptionsWebSock(t) {
        this.setState({ websockUrl: t.trim() });
        if (!t || (t.trim() === this.local.webSocketUrl)) {
            console.info(t, 7);
            return;
        }
        if (this.local.setWebSockUrl(t.trim())) {
            this._saveOptions();
        }
        console.log(t, 0, this.local.webSocketUrl);
    }

}

export const styles = StyleSheet.create({
    input: {
        backgroundColor: "#001", color: '#fff', margin: 4, padding: 7, borderRadius: 10, borderColor: "#0000", fontSize: 16
    },
    headerText: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', paddingBottom: 12 },
    footerButton: {
        marginTop: 10
    }

});
