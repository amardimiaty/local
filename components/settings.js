import React, { Component } from "react";
import { View, Image, TouchableOpacity, TextInput, Modal, Animated, Alert } from "react-native";
import { Icon, ActionSheet, Text, Button, Input, Toast, Root, Item, CheckBox, Switch, Label, ProgressBar } from 'native-base';


export default class Settings extends Component {
    constructor(props) {
        super(props)
    }
    
    render() {
        return (
            <View alignItems={"stretch"} alignContent={'space-between'} style={{ padding: 25, margin: 25, borderRadius: 15 }} backgroundColor={"#ddd"} justifyContent={"flex-start"} >
                <Text style={styles.headerText} >Settings</Text>
                <ScrollView>
                    <Item style={{ borderBottomWidth: 0 }} >
                        <Icon name={'globe'} />
                        <Input padding={8} maxHeight={40} label='Server Url' underlineColorAndroid={'transparent'} style={[styles.input, { fontSize: 14, padding: 10, textAlign: 'center' }]} onChangeText={this.saveOptionsWebUrl.bind(this)} placeholder={"enter web server address"} value={this.props.webappUrl} />
                    </Item>
                    {this.props.useWebsockets ?
                        <Item style={{ borderBottomWidth: 0 }} >
                            <Icon name={'sync'} />
                            <Input padding={8} maxHeight={40} label='Server Url' underlineColorAndroid={'transparent'} style={[styles.input, { fontSize: 14, padding: 10, textAlign: 'center' }]} onChangeText={this.saveOptionsWebSock.bind(this)} placeholder={"enter socket server address"} value={this.props.websockUrl} />
                        </Item>
                        : null}
                    {this.props.useWebsockets ?
                        <Button transparent bordered info block rounded style={{ margin: 6, borderColor: '#000', justifyContent: 'center', alignContent: 'stretch' }} onPress={() => { this.setState({ showIndicator: true }); this.local.getWebSocketUrl((url, err) => { if (url) { console.log(url); this.saveOptionsWebSock(url); } this.setState({ showIndicator: false }); }) }} >
                            <Text style={{ color: '#111', fontSize: 13 }} >Fetch WebSocket Url</Text>
                        </Button>
                        : null}
                    <Item underline={false} style={{ borderBottomWidth: 0, margin: 6, justifyContent: 'center', alignContent: 'stretch' }}  >
                        <Label>Use WebSockets?</Label>
                        <Switch value={this.state.useWebsockets} onValueChange={(t) => { this.setState({ useWebsockets: t }); if (t === this.local.useWebSock) { return; } this.local.useWebSock = t; console.log(t, this.local); this._saveOptions(); }} />
                    </Item>
                    {this.props.hasFingerprint ?
                        <Item underline={false} style={{ borderBottomWidth: 0, margin: 6, justifyContent: 'center', alignContent: 'stretch' }}  >
                            <Label ><Icon name={'finger-print'} style={{ fontSize: 20 }} /> &nbsp;&nbsp;Use Fingerprint?</Label>
                            <Switch value={this.props.useFingerprint} onValueChange={(t) => { this.setState({ useFingerprint: t }); }} />
                        </Item>
                        : null}
                    <Item stackedLabel underline={false} style={{ margin: 7, justifyContent: 'center', alignContent: 'stretch' }}  >
                        <Label ><Icon name={'battery-full'} style={{ fontSize: 15 }} /> &nbsp;PowerSaver: {Local.PowerSaver[this.props.powerSaver]}</Label>
                        <Slider style={{ margin: 6, marginTop: 19 }} alignSelf={'stretch'} maximumValue={2} minimumValue={0} step={1} value={0} onValueChange={v => { this.setState({ powerSaver: v }); this.local.powerSaver = v; console.log("Powersaver: " + Local.PowerSaver[v], v); this._saveOptions(); }} />
                    </Item>
                </ScrollView>
                <Button style={styles.footerButton} icon block rounded danger onPress={buton => { this.setState({ showOptions: false }) }} >
                    <Icon name={'close'} />
                </Button>
            </View>
        )
    }

}
