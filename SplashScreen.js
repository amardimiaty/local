import React, { Component } from 'react';
import { View, Text, Icon, Button, InputGroup, Input, ProgressBar } from 'native-base';
import { StatusBar, AsyncStorage, Modal } from 'react-native';
import Expo from 'expo';

export default class SplashScreen extends Component {

    static navigationOptions = { header: null }
    state = { showLogin: false, username: null, pass: null, loadedFont: false }

    constructor(props) {
        super(props)
        Expo.Font.loadAsync({
            'Roboto': require('native-base/Fonts/Roboto.ttf'),
            'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
        }).then(() => {
            this.setState({ loadedFont: true });
        });
    }

    componentDidMount() {
        StatusBar.setHidden(true);
        this.timeoutID = setTimeout(() => {
            this.props.navigation.navigate("Home");
        }, 2000);
        // AsyncStorage.getItem('USER_TOKEN', (err, res) => {
        //     if (err || !res) {
        //         return;
        //     }

        // })
    }
    componentWillMount() {

    }

    onAuthPress(e) {
        this.setState({ showLogin: true })
        console.log(e)
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutID);
    }

    render() {
        return (
            <View flex={1} alignItems={"center"} style={{ backgroundColor: "#001" }} justifyContent={'center'}>
                <Icon name={'map'} style={{ color: "#fff", fontSize: 50 }} />
                <View>
                    <Text style={{ textAlign: 'center', fontSize: 30, color: "#fef" }} >Local</Text>
                    <Text style={{ textAlign: 'center', fontSize: 13, color: "#bbb" }} >Version 1.0.1</Text>
                </View>
                {/* {this.state.loadedFont ?
                    <Button style={{ marginTop: 20 }} disabled={false} active light rounded block onPress={this.onAuthPress}>
                        <Text style={{ textAlign: 'center', color: "#000" }} >Login or Register</Text>
                    </Button>
                    : null}
                <Modal onRequestClose={()=>{}} visible={this.state.showLogin}>
                    <View>
                        <Input underlineColorAndroid={null} placeholder={"enter Username"} value={this.state.username} />
                        <Input secureTextEntry={true} placeholder={"enter Password"} value={this.state.pass} />
                    </View>
                </Modal> */}
            </View>
        )
    }
}