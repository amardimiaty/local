import Local, { debounce } from "../src/Local";
import { styles } from "../SplashScreen";

import React, { Component } from "react";
import { View, Image, TouchableOpacity, TextInput, BackPressEventName, BackHandler, Modal, Animated, Alert, FlatList } from "react-native";
import { Icon, ActionSheet, Text, Button, Input, Toast, Root, Item, CheckBox, Switch, Label, ProgressBar } from 'native-base';
import SearchItem from "./searchitem";


export default class Omnibar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputText: "", showModal: false, modal: { car: null, color: null, type: null, year: null },
            searchArray: [], showResults: false, loadingResults: false
        }
        this.buttonColor = '#555';
        this.stat={searchArray:null};//Testing autofill

        this._search = debounce((t) => {
            let text = t || ''; // this should default to not filtering at all

            this.setState({ loadingResults: true });
            if (this.props.cars.length > 0) {
                // if (!text.trim()) {
                //     this.setState({searchArray: this.props.cars, loadingResults: false});
                // }
                regx = new RegExp(".*(" + text + ").*", 'i');
                new Promise((res, rej) => {
                    res(this.props.cars.filter((vehicle) => {
                        // console.log(vehicle.brand, text, regx);
                        return vehicle.model.concat(vehicle.brand, vehicle.type, vehicle.color).search(regx) >= 0;
                    }));
                }).then(val => {
                    console.log('Filtered vehicles: ',val);
                    this.stat.searchArray = val;// TODO: Remove test 
                    this.setState({ searchArray: val || null, loadingResults: false});
                }, err => {
                    console.info(err);
                    this.setState({ loadingResults: false });
                });
            } else {
                this.setState({ searchArray: null, loadingResults: false });
            }
        }, 75).bind(this);

        BackHandler.addEventListener(BackPressEventName, () => {
            console.log("back button pressed");
            if (this.state.showResults) {
                this.setState({ showResults: false });
                return true;
            }
        });
    }

    onInputChange(t) {
        this.setState({ inputText: t });
        console.log('love5555');
        this._search(t);
    }

    onOptionsPress() {
        // this.showModal({ data: true });
        let options = [
            { icon: 'person', text: "View Profile" },
            { icon: 'settings', text: "Settings" },
            { icon: 'log-out', text: "Logout" }
        ]
        ActionSheet.show({ options: options }, (index) => {
            switch (index) {
                case 2: return this.props.local.logout(() => {
                    this.props.user.login({});
                    this.props.user.save();
                    this.props.logout("Splash");
                });
            }
        });
    }

    getCarProfile() {
        return (
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
            </Modal>
        )
    }

    _onPressItem(item) {
        if (item) {
            this.props.setCoordinate(item.location);
            this.state.modal.car = item.brand.concat(" ", item.model, " (", item.vid, ")");
            this.state.modal.color = item.color;
            this.state.modal.type = item.type;
            this.state.modal.year = item.year;
            return this.setState({ showModal: true, showResults: false });
        }
    }

    render() {
        return (
            <View style={[this.props.style, { flex: -1, justifyContent: 'flex-start', alignItems: 'stretch', maxHeight: this.state.showResults ? null : 105, alignContent: 'center' }]} onStartShouldSetResponder={(ev)=>{ this.setState({ showResults: false }); return false;}} >
                <View style={{ justifyContent: "center", alignItems: "stretch", borderRadius: 10, maxHeight: 50, flex: 1, flexDirection: "row", backgroundColor: '#335' }}>
                    <TextInput onFocus={() => { this.setState({ showResults: true }) }} onBlur={() => { if (!this.stat.searchArray) { this.setState({ showResults: false }) } }} ref={el => { this._searchText = el }} placeholderTextColor="#aaaa" style={{ flex: 9, color: "#fff", padding: 12 }} onChangeText={this.onInputChange.bind(this)} value={this.state.inputText} placeholder="Search Local" underlineColorAndroid="transparent" clearButtonMode="always" ></TextInput>
                    <TouchableOpacity borderLeftWidth={1} borderLeftColor="#558" onPress={this.onOptionsPress.bind(this)} style={{ backgroundColor: '#3355', borderRadius: 10, flex: 1, alignItems: "center", padding: 12 }}>
                        <View>
                            <Icon name="more" style={{ color: "#eee" }} />
                        </View>
                    </TouchableOpacity>
                </View>
                {this.state.showResults ?
                    <View style={{ backgroundColor: '#fff', borderRadius: 10, marginTop: 2, paddingTop: 15, paddingBottom: 15 }} justifyContent='center'>
                        <FlatList keyExtractor={(item, index) => item.vid} data={this.state.searchArray} renderItem={item => <SearchItem item={item} onPress={item => this._onPressItem} >dd</SearchItem>}
                            ListEmptyComponent={
                                <View flex={1} alignContent={'stretch'} alignItems={'stretch'} flex={1} flexDirection={'row'} justifyContent={'center'} >
                                    <Icon style={{ color: '#f88b', fontSize: 20 }} name={'alert'} />
                                    <Text style={{ textAlign: 'center', color: '#888b' }}> no car matches your search</Text>
                                </View>
                            } refreshing={this.state.loadingResults} />
                            {/* {this.state.searchArray.map(item=>{
                                console.log(item);
                                return <Text item={item} onPress={item => this._onPressItem} >dd</Text>
                            })} */}
                    </View>
                    : null
                }

            </View >
        )
    }

}
