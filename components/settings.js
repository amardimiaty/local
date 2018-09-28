import React, { Component } from "react";
import { View, Image, TouchableOpacity, TextInput, Modal, Animated, Alert } from "react-native";
import { Icon, ActionSheet, Text, Button, Input, Toast, Root, Item, CheckBox, Switch, Label, ProgressBar } from 'native-base';
 

export default class Omnibar extends Component {
    constructor(props) {
    }

    onInputChange() {
        let text = this.state.inputText.trim()
        if (this.props.cars.length > 0 && text) {
            regx = new RegExp(".*(" + text + ").*", 'i');
            let search = [];
            new Promise((res, rej) => {
                let filter = this.props.cars.filter((vehicle) => {
                    console.log(vehicle.brand, text, regx);
                    return vehicle.model.concat(vehicle.brand, vehicle.type, vehicle.color).search(regx) >= 0;
                });
                search = filter;
                res(filter.map((val) => {
                    return { key: val.id, text: val.brand.concat(" ", val.model, " (", val.vid, ")"), icon: 'car' }
                }));
            }).then(res => {
                if (res.length > 0) {
                    ActionSheet.show({ options: res, title: "Choose A Car: " }, (index) => {
                        this.state.modal.car = search[index].brand.concat(" ", search[index].model, " (", search[index].vid, ")");
                        this.state.modal.color = search[index].color;
                        this.state.modal.type = search[index].type;
                        this.state.modal.year = search[index].year;
                        return this.setState({ showModal: true });
                    });
                } else {
                    ActionSheet.show({ options: [{ text: "No Car Available!" }], title: "Choose A Car: " }, (index) => {
                        return null;
                    });
                }
            });
        } else {
            Alert.alert("No car available or empty input!")
        }
    }

    onOptionsPress() {
        // this.showModal({ data: true });
        ActionSheet.show({ options: [{ icon: 'log-out', text: "Logout" }] }, (index) => {
            return this.props.local.logout(() => {
                this.props.user.login({});
                this.props.user.save();
                this.props.logout("Splash");
            });
        });
    }

    render() {
        return (
            <View style={{ justifyContent: "center", alignItems: "stretch", flex: 1, flexDirection: "row" }}>
                <TextInput ref={el => { this._searchText = el }} placeholderTextColor="#bbb" style={{ flex: 9, color: "#eee", padding: 12 }} onChangeText={text => { this.setState({ inputText: text }) }} value={this.state.inputText} placeholder="Search Local" underlineColorAndroid="transparent" clearButtonMode="always" onSubmitEditing={this.onInputChange.bind(this)} ></TextInput>
                <TouchableOpacity borderLeftWidth={1} borderLeftColor="#558" onPress={this.onOptionsPress.bind(this)} style={{ flex: 1, alignItems: "center", padding: 12 }}>
                    <View>
                        <Icon name="more" style={{ color: "#eee" }} />
                    </View>
                </TouchableOpacity>
                {
                    <Modal visible={this.state.showModal} onRequestClose={() => { }} transparent={true} animationType={'fade'} >
                        <View flex={1} justifyContent={'center'} backgroundColor={'#4447'} >
                            <View alignItems={"stretch"} alignContent={'space-between'} style={{ padding: 25, margin: 25, borderRadius: 15 }} backgroundColor={"#ddd"} justifyContent={"flex-start"} >
                                <Text style={styles.header} ><Icon name={'car'} />&emsp;{this.state.modal.car}</Text>
                                <Item>
                                    <Label>Color</Label>
                                    <Text padding={3} style={[{ fontSize: 18, padding: 10, textAlign: 'center' }]}>{this.state.modal.color}</Text>
                                </Item>
                                <Item>
                                    <Label>Type</Label>
                                    <Text padding={3} style={[{ fontSize: 18, padding: 10, textAlign: 'center' }]}>{this.state.modal.type}</Text>
                                </Item>
                                <Item>
                                    <Label>Year</Label>
                                    <Text padding={3} style={[{ fontSize: 18, padding: 10, textAlign: 'center' }]}>{this.state.modal.year}</Text>
                                </Item>
                                <Button style={styles.footer} rounded icon block danger onPress={buton => { this.setState({ showModal: false }) }} >
                                    <Icon name={'close'} />
                                </Button>
                            </View>
                        </View>
                    </Modal>}

            </View>
        )
    }

}
