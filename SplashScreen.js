import React, { Component } from 'react';
import { View, Text, Icon, Button, Input, Toast, Root, Item, CheckBox, Switch, Label, ProgressBar } from 'native-base';
import { StatusBar, AsyncStorage, Alert, Modal, ScrollView, StyleSheet, BackPressEventName, BackHandler } from 'react-native';
import Expo from 'expo';
import Local, { User } from './src/Local';
import { TextInput } from './node_modules/react-native-gesture-handler';

export default class Splash extends Component {

    static navigationOptions = { header: null }
    state = { settingsLoaded: false, useWebsockets: true, webappUrl: '', websockUrl: '', webConfig: {}, showOptions: false, showLogin: false, showRegister: false, username: null, loginPass: null, regPass: null, regPassVerify: null, loadedFont: false }
    running = true;

    constructor(props) {
        super(props)
        Expo.Font.loadAsync({
            'Roboto': require('native-base/Fonts/Roboto.ttf'),
            'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
        }).then(() => {
            this.setState({ loadedFont: true });
        });

        AsyncStorage.getItem('web.config', (err, res) => {
            if (err) {
                console.error(err);
            }
            console.log(res);
            if (!this.running) {
                return;
            }
            let webConfig = JSON.parse(res);
            this.setState({ webConfig, webappUrl: webConfig.WEBSOCK_URL, websockUrl: webConfig.WEBSOCK_URL, useWebsockets: webConfig.USE_WEBSOCK });
            this.local = new Local(this.state.webConfig);
            this.setState({ settingsLoaded: true });
        }).catch(err => { console.log(err) });


        BackHandler.addEventListener(BackPressEventName, () => {
            if (this.state.showLogin) {
                this.resetModal()
                return true;
            }
        })
    }

    componentDidMount() {
        console.log(this.state.webConfig.WEBAPP_URL, 444)
        StatusBar.setHidden(true);
        // this.timeoutID = setTimeout(() => {
        //     this.props.navigation.navigate("Home");
        // }, 2000);
        // AsyncStorage.getItem('USER_TOKEN', (err, res) => {
        //     if (err || !res) {
        //         return;
        //     }

        // })
    }

    startApp(params) {
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
        this.setState({ showLogin: false });
    }

    registerUser() {
        if (!this.state.username || !this.state.username.trim() || !this.state.regPass || !this.state.regPassVerify) {
            Toast.show({ text: "Ensure that no field is empty!", type: 'danger', position: 'bottom' });
            return;
        }
        try {
            this.local.addUser({ username: this.state.username, password: this.state.regPass, v_password: this.state.regPassVerify }, (user) => {
                AsyncStorage.setItem('user.name', this.state.username);
                this.startApp({ user: user, local: this.local });
            });
        } catch (err) {
            console.log(err);
            Toast.show({ text: err.message, position: 'bottom', type: 'danger' });
        }
    }

    loginUser() {
        if (!this.state.username || !this.state.username.trim() || !this.state.loginPass) {
            Toast.show({ text: "Ensure that no field is empty!", type: 'danger', position: 'bottom' });
            return;
        }
        try {
            this.local.loginUser({ username: this.state.username, password: this.state.loginPass }, (user) => {
                this.startApp({ user: user, local: this.local });
            });
        } catch (err) {
            console.error(err);
        }
    }

    render() {
        /* Do note that nesting registration condition within login condition may be a bad idea... Well!!!!!*/
        return (
            <Root flex={1}>
                <View flex={1} alignItems={"center"} style={{ backgroundColor: "#001" }} justifyContent={'center'}>
                    <Modal visible={this.state.showOptions} onRequestClose={() => { }} transparent={true} animationType={'fade'} >
                        <View flex={1} justifyContent={'center'} backgroundColor={'#2227'} >
                            <View alignItems={"stretch"} alignContent={'space-between'} style={{ padding: 25, margin: 25, borderRadius: 15 }} backgroundColor={"#ddf"} justifyContent={"flex-start"} >
                                <Text style={styles.header} >Settings</Text>
                                <TextInput padding={8} maxHeight={50} label='Server Url' underlineColorAndroid={'transparent'} style={[styles.input, { fontSize: 18, padding: 10, textAlign: 'center' }]} onChangeText={(t) => { if (!t || t === this.state.webConfig.WEBAPP_URL) { console.info(t, 6); return } let config = this.state.webConfig; config.WEBAPP_URL = t.trim(); console.log(config); this.setState({ webConfig: config, webappUrl: config.WEBAPP_URL }); this.local.setWebAppUrl(t); AsyncStorage.setItem('web.config', JSON.stringify(this.state.webConfig), (err) => { if (err) { console.log(err); } }) }} placeholder={"enter web server address"} defaultValue={this.state.webConfig['WEBAPP_URL']} value={this.state.webappUrl} />
                                {this.state.useWebsockets ?
                                    <TextInput editable={this.state.useWebsockets} padding={8} maxHeight={50} label='Server Url' underlineColorAndroid={'transparent'} style={[styles.input, { fontSize: 18, padding: 10, textAlign: 'center' }]} onChangeText={(t) => { if (!t || t === this.state.webConfig.WEBSOCK_URL) { console.info(t, 6); return } let config = this.state.webConfig; config.WEBSOCK_URL = t.trim(); console.log(config); this.setState({ webConfig: config, websockUrl: config.WEBSOCK_URL }); this.local.setWebSockUrl(t); AsyncStorage.setItem('web.config', JSON.stringify(this.state.webConfig), (err) => { if (err) { console.log(err); } }) }} placeholder={"enter socket server address"} defaultValue={this.state.webConfig['WEBSOCK_URL']} value={this.state.websockUrl} />
                                    : null}
                                <Item style={{ margin: 4, justifyContent: 'center', alignContent: 'stretch' }}  >
                                    <Label>Use WebSockets?</Label>
                                    <Switch value={this.state.useWebsockets} onValueChange={(t) => { let config = this.state.webConfig; config.USE_WEBSOCK = t; console.log(t, config); this.setState({ webConfig: config, useWebsockets: config.USE_WEBSOCK }); AsyncStorage.setItem('web.config', JSON.stringify(this.state.webConfig), (err) => { if (err) { console.log(err); } }) }} />
                                </Item>
                                <Button style={styles.footer} rounded icon block danger onPress={buton => { this.setState({ showOptions: false }) }} >
                                    <Icon name={'close'} />
                                </Button>
                            </View>
                        </View>
                    </Modal>
                    {/* {this.state.showLogin ? */}
                    <Modal visible={this.state.showLogin && this.state.loadedFont} onRequestClose={() => { }} transparent={true} animationType={'slide'} >
                        <View flex={1} backgroundColor={'#0005'} >
                            {this.state.showRegister ?
                                <View alignItems={"stretch"} flex={1} style={{ padding: 20, margin: 40, borderRadius: 15 }} backgroundColor={"#ddf"} justifyContent={"center"} >
                                    <Input maxHeight={50} label='Username' underlineColorAndroid={'transparent'} style={styles.input} onChangeText={(t) => { this.setState({ username: t.trim() }) }} placeholder={"enter Username"} value={this.state.username} />
                                    <Input maxHeight={50} label='Password' underlineColorAndroid={'transparent'} style={styles.input} onChangeText={(t) => { this.setState({ regPass: t }) }} secureTextEntry={true} placeholder={"enter Password"} value={this.state.regPass} />
                                    <Input maxHeight={50} label='Verify Password' underlineColorAndroid={'transparent'} style={styles.input} onChangeText={(t) => { this.setState({ regPassVerify: t }) }} secureTextEntry={true} placeholder={"verify Password"} value={this.state.regPassVerify} />
                                    <Text onPress={() => this.setState({ showRegister: false })} style={{ textAlign: 'center', padding: 4, fontSize: 18, fontWeight: 'bold', color: '#227' }} >Already have an account?</Text>
                                    <View flexDirection={'row-reverse'} alignContent={'stretch'} justifyContent={'space-between'} >
                                        <Button iconRight={true} icon rounded block success onPress={this.registerUser.bind(this)} >
                                            <Text>Register</Text><Icon name="person-add" />
                                        </Button>
                                        <Button rounded block danger onPress={this.resetModal.bind(this)} >
                                            <Icon name='close' /><Text>Cancel</Text>
                                        </Button>
                                    </View>
                                </View>
                                :
                                <View alignItems={"stretch"} alignContent={'center'} flex={1} style={{ padding: 20, margin: 40, borderRadius: 15 }} backgroundColor={"#ddf"} justifyContent={"center"} >
                                    <Input maxHeight={50} underlineColorAndroid={'transparent'} style={styles.input} placeholder={"enter Username"} onChangeText={(t) => { this.setState({ username: t.trim() }) }} value={this.state.username} />
                                    <Input maxHeight={50} underlineColorAndroid={'transparent'} style={styles.input} secureTextEntry={true} onChangeText={(t) => { this.setState({ loginPass: t }) }} placeholder={"enter Password"} value={this.state.loginPass} />
                                    <Text onPress={() => this.setState({ showRegister: true })} style={{ textAlign: 'center', padding: 4, fontSize: 18, fontWeight: 'bold', color: '#227', marginTop: 5, marginBottom: 5 }} >Create a new account?</Text>
                                    <View flexDirection={'row-reverse'} alignContent={'stretch'} justifyContent={'space-between'} >
                                        <Button iconRight rounded block primary onPress={this.loginUser.bind(this)} >
                                            <Text>Login</Text><Icon name="log-in" />
                                        </Button>
                                        <Button rounded block danger onPress={this.resetModal.bind(this)} >
                                            <Icon name='close' /><Text>Cancel</Text>
                                        </Button>
                                    </View>
                                </View>
                            }
                        </View>
                    </Modal>
                    {/* : null} */}
                    <Button disabled={!this.state.settingsLoaded} rounded bordered icon style={{ position: 'absolute', top: 10, right: 10 }} onPress={() => { this.setState({ showOptions: true }) }} >
                        <Icon name={'settings'} />
                    </Button>
                    <Icon name={'map'} style={{ color: "#fff", fontSize: 50 }} />
                    <View>
                        <Text style={{ textAlign: 'center', fontSize: 30, color: "#fef" }} >Local</Text>
                        <Text style={{ textAlign: 'center', fontSize: 13, color: "#bbb" }} >Version 1.0.1</Text>
                    </View>
                    {this.state.loadedFont && this.state.settingsLoaded ?
                        <Button style={{ marginTop: 20, marginLeft: 25, marginRight: 25 }} disabled={false} light rounded block onPress={() => { this.setState({ showLogin: true }) }}>
                            <Icon name="log-in" /><Text style={{ textAlign: 'center', color: "#000" }} >Login or Register</Text>
                        </Button>
                        :
                        null
                    }
                    <Text style={{ textAlign: 'center', color: '#aaa', fontSize: 13, position: 'absolute', bottom: 10, left: 0, right: 0 }} >&copy; 2018 Agwa Israel Onome</Text>
                </View>
            </Root>
        )
    }
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: "#001", color: '#fff', margin: 4, padding: 0, borderRadius: 10
    },
    header: { textAlign: 'center', position: 'relative', top: 0, right: 0, left: 0, fontSize: 18, fontWeight: 'bold', paddingBottom: 12 },
    footer: {
        position: 'relative', bottom: 0, right: 0, left: 0, marginTop: 15
    }

})