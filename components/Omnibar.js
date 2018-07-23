import Local from "../src/Local";

import React, { Component } from "react";
import { View, Image, Button, TouchableNativeFeedback, TextInput, Modal, UIManager } from "react-native";
import { Icon } from "native-base";

export default class Omnibar extends Component {
    local = new Local();

    constructor(props) {
        super(props);
        this.state = {
            inputText: "", showModal: false, modal: {
                data: null, onClose: () => {
                }
            }
        }
    }

    showModal(modal) {
        if (this.state.modal === modal)
            return

        if (modal) {
            this.setState({ showModal: true, modal: modal })
        } else {
            this.setState({ showModal: false, modal: null })
        }
    }

    onInputChange(text) {
        if (text !== this.state.input) {
            this.setState({ inputText: text })
        }
    }

    onOptionsPress(){
        this.showModal();
    }

    render() {
        return (
            <View>
                <TextInput value={this.state.inputText} placeholderTextColor="#888" style={{ flex: 9, color: "#eee", padding: 12 }} placeholder="Search local" underlineColorAndroid="transparent" clearButtonMode="while-editing" onChangeText={this.onInputChange.bind(this)} ></TextInput>
                <View borderLeftWidth={1} borderLeftColor="#88a" style={{ flex: 1, alignItems: "center",padding: 12}} onPress={this.onOptionsPress}>
                    <Icon name="more" style={{ color: "#eee" }}/>
                </View>
                {this.state.showModal ?
                    <Modal animationType="slide" transparent={true} onRequestClose={this.state.modal.onClose}>
                        <View style={{ margin: 12 }}>
                        {}
                        </View>
                    </Modal>
                    : null}

            </View>
        )
    }

}
