import Local from "../src/Local";

import React, { Component } from "react";
import { View, Text, Image, Button, TouchableOpacity, TextInput, Modal, Animated, Alert } from "react-native";
import { Icon, ActionSheet } from "native-base";

export default class Omnibar extends Component {
    local = new Local();

    constructor(props) {
        super(props);
        this.state = {
            inputText: "", showModal: false, modal: {
                title: "More options", data: null, onClose: () => {
                }
            }
        }
        this.animatedValue = new Animated.Value(1);
        this.buttonColor = '#555';
    }

    showModal(modal) {
        console.log(modal)

        if (this.state.modal === modal)
            return

        if (modal) {
            this.setState({ showModal: true, modal: modal })
        } else {
            this.setState({ showModal: false, modal: null })
        }
    }

    onInputChange(text) {
        return;
        if (this.props.cars && text.trim()) {
            this.setState({ inputText: text });
            regx = new RegExp("\.*" + text + "\i");
            search = new Promise((res, rej) => {
                let filter = this.props.cars.filter((vehicle) => {
                    return vehicle.model.concat(vehicle.brand, vehicle.type, vehicle.color).search(regx) >= 0;
                });
                res(filter.map((val) => {
                    return { key: val.id,text: val.brand.concat(" ", val.model, " (", val.vid, ")") }
                }));
            }).then(res => {
                if (res.length > 0) {
                    ActionSheet.show({ options: res, title: "Choose A Car: " }, (index) => {
                        return null;
                    });
                } else {
                    ActionSheet.show({ options: [{ text: "No Car Available!" }], title: "Choose A Car: " }, (index) => {
                        return null;
                    });
                }
            });
        }
    }

    onOptionsPress() {
        // this.showModal({ data: true });
        Alert.alert("Hello world!")
        console.log(this.props.cars)
    }

    render() {
        return (
            <View style={{ justifyContent: "center", alignItems: "stretch", flex: 1, flexDirection: "row" }}>
                <TextInput placeholderTextColor="#888" style={{ flex: 9, color: "#eee", padding: 12 }} placeholder="Search local" underlineColorAndroid="transparent" clearButtonMode="always" onSubmitEditing={this.onInputChange.bind(this)} ></TextInput>
                <TouchableOpacity borderLeftWidth={1} borderLeftColor="#558" onPress={this.onOptionsPress.bind(this)} style={{ flex: 1, alignItems: "center", padding: 12 }}>
                    <View>
                        <Icon name="more" style={{ color: "#eee" }} />
                    </View>
                </TouchableOpacity>
                {/* {!this.state.showModal ?
                    <Modal animationType="slide" transparent={true} onRequestClose={this.state.modal.onClose}>
                        <View style={{ margin: 12 }}>
                            <Text>
                                {this.state.modal.title}
                             </Text>
                        </View> 
                    </Modal>
                    : null} */}

            </View>
        )
    }

}
