import { ActionSheet, Body, Button, Footer, Icon, Input, Item, ListItem, Text } from 'native-base';
import React, { Component } from "react";
import { BackHandler, FlatList, Modal, TouchableOpacity, View, BackPressEventName } from "react-native";
import { styles } from "../SplashScreen";
import Local, { debounce } from "../src/Local";
import SearchItem from "./searchitem";



export default class Omnibar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputText: "", showModal: false, modal: { car: null, color: null, type: null, year: null },
            searchArray: [], showResults: false, loadingResults: false
        }
        this.buttonColor = '#555';

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
                    console.log('Filtered vehicles: ', val);
                    this.stat.searchArray = val;// TODO: Remove test 
                    this.setState({ searchArray: val || null, loadingResults: false });
                }, err => {
                    console.info(err);
                    this.setState({ loadingResults: false });
                });
            } else {
                this.setState({ searchArray: null, loadingResults: false });
            }
        }, 250).bind(this);

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
        this._search(t);
    }

    onOptionsPress() {
        // this.showModal({ data: true });
        let options = [
            { icon: 'car', text: "Add Vehicle" },
            { icon: 'car', text: "List Vehicles" },
            { icon: 'log-out', text: "Logout" }
        ]
        ActionSheet.show({ options: options }, (index) => {
            switch (index) {
                case 2: return this.props.local.logout(() => {
                    this.props.user.login({});
                    this.props.user.save();
                    this.props.logout("Splash");
                });
                case 0:
                    this.props.addVehicle()
                    break
                case 1:
                    this.props.listVehicles()
                    break
            }
        });
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
            <View style={[this.props.style, { justifyContent: 'flex-end', width: 'auto', alignItems: 'flex-start', maxHeight: this.state.showResults ? null : 105, alignContent: 'center' }]} onStartShouldSetResponder={(ev) => { this.setState({ showResults: false }); return false; }} >
                <View style={{ justifyContent: "flex-end", alignItems: "flex-end", borderRadius: 10, maxHeight: 50, flexDirection: "column", backgroundColor: '#335' }}>
                    {/* <TextInput  onFocus={() => { this.setState({ showResults: true }) }} onBlur={() => { if (!this.stat.searchArray) { this.setState({ showResults: false }) } }} ref={el => { this._searchText = el }} placeholderTextColor="#aaaa" style={{ flex: 9, color: "#fff", padding: 12 }} onChangeText={this.onInputChange.bind(this)} value={this.state.inputText} placeholder="Search Local" underlineColorAndroid="transparent" clearButtonMode="always" ></TextInput> */}
                    <TouchableOpacity borderLeftWidth={1} borderLeftColor="#558" onPress={this.onOptionsPress.bind(this)} style={{ backgroundColor: '#3355', borderRadius: 10, flex: 1, alignItems: "center", padding: 12 }}>
                        <View>
                            <Icon name="more" style={{ color: "#eee" }} />
                        </View>
                    </TouchableOpacity>
                </View>
                {this.state.showResults ?
                    <View style={{ backgroundColor: '#fff', borderRadius: 10, marginTop: 2, paddingTop: 15, paddingBottom: 15 }} justifyContent='center'>
                        <FlatList keyExtractor={(item, index) => item.vid} data={this.state.searchArray} renderItem={({ item }) => <SearchItem item={item} onPress={this._onPressItem.bind(this)} />}
                            ListEmptyComponent={
                                <View flex={1} alignContent={'stretch'} alignItems={'stretch'} flex={1} padding={'4'} flexDirection={'row'} justifyContent={'center'} >
                                    <Icon style={{ color: '#f88b', fontSize: 20 }} name={'alert'} />
                                    <Text style={{ textAlign: 'center', color: '#888b' }}> no car matches your search</Text>
                                </View>
                            } refreshing={this.state.loadingResults} extraData={this.state} />
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

export class AddCarDialog extends Component {
    state = {
        model: '',
        brand: '',
        year: '',
        vid: '',// uniquely indexed
        color: '',
        type: '',
        profile: ''
    }

    registerVehicle() {
        this.props.local.addVehicle(this.props.user.username, { ...this.state, location: { ...this.props.user.location || { longitude: 0, latitude: 0 } }, year: parseInt(this.state.year), timestamp: Date.now() }, (res, err) => {
            if (err) return Local.toast(err.message || 'Could not add vehicle!', { type: 'error' })
            Local.toast('Successfully added vehicle!')
            this.props.successCallback()
            this.props.closeDialog()
        })
    }

    render() {
        let { props } = this
        return (
            <Modal visible={props.showModal} onRequestClose={() => { }} transparent={true} animationType={'fade'} >
                <View flex={1} justifyContent={'center'} backgroundColor={'#4447'} >
                    <View alignItems={"stretch"} alignContent={'space-between'} style={{ padding: 25, margin: 25, borderRadius: 15 }} backgroundColor={"#ddd"} justifyContent={"center"} >
                        <Text style={styles.header} >Add A Vehicle</Text>
                        <Item style={{ borderBottomWidth: 0 }} >
                            <Input maxHeight={50} label='Model' underlineColorAndroid={'transparent'} style={styles.input} onChangeText={(t) => { this.setState({ model: t.trim() }) }} placeholder={"enter model"} value={this.state.model} />
                        </Item>
                        <Item style={{ borderBottomWidth: 0 }} >
                            <Input maxHeight={50} label='Brand' underlineColorAndroid={'transparent'} style={styles.input} onChangeText={(t) => { this.setState({ brand: t }) }} placeholder={"enter vehicle brand"} value={this.state.brand} />
                        </Item>
                        <Item style={{ borderBottomWidth: 0 }} >
                            <Input maxHeight={50} label='year' underlineColorAndroid={'transparent'} style={styles.input} onChangeText={(t) => { this.setState({ year: t }) }} placeholder={"enter vehicle year of production"} value={this.state.year} />
                        </Item>
                        <Item style={{ borderBottomWidth: 0 }} >
                            <Input maxHeight={50} label='Vehicle Number' underlineColorAndroid={'transparent'} style={styles.input} onChangeText={(t) => { this.setState({ vid: t }) }} placeholder={"enter vehicle number"} value={this.state.vid} />
                        </Item>
                        <Item style={{ borderBottomWidth: 0 }} >
                            <Input maxHeight={50} label='Vehicle Color' underlineColorAndroid={'transparent'} style={styles.input} onChangeText={(t) => { this.setState({ color: t }) }} placeholder={"enter vehicle color"} value={this.state.color} />
                        </Item>
                        <Item style={{ borderBottomWidth: 0 }} >
                            <Input maxHeight={50} label='Vehicle Type' underlineColorAndroid={'transparent'} style={styles.input} onChangeText={(t) => { this.setState({ type: t }) }} placeholder={"enter vehicle type"} value={this.state.type} />
                        </Item>
                        <View flexDirection={'row-reverse'} alignContent={'stretch'} justifyContent={'space-between'} >
                            <Button iconRight={true} icon rounded block success onPress={this.registerVehicle.bind(this)} >
                                <Text>Add Vehicle</Text><Icon name="add" />
                            </Button>
                            <Button style={styles.footer} rounded icon block danger onPress={buton => { props.closeDialog() }} >
                                <Icon name={'close'} />
                            </Button>
                        </View>

                    </View>
                </View>
            </Modal>
        )
    }
}


export class ListCarDialog extends Component {
    state = {
        showConfirmDelete: false,
        confirmationMessage: ''
    }
    selected = null

    deleteSelected(id, confirmationMessage) {
        this.selected = id
        this.setState({ showConfirmDelete: true, confirmationMessage })
    }

    deleteVehicle(confirmed) {
        let selected = this.selected
        this.selected = null
        if (!confirmed) return
        console.log('delete ', selected)
        this.props.local.deleteVehicle(this.props.user.username, selected, (res, err) => {
            if (err) return Local.toast(err.message || 'Could not delete vehicle!', { type: 'error' })
            Local.toast(`Successfully deleted vehicle (${selected})!`)
            this.props.successCallback()
            this.props.closeDialog()
        })
    }

    render() {
        let { props } = this
        return (
            <Modal visible={props.showModal} onRequestClose={() => { }} transparent={true} animationType={'fade'} >
                <View flex={1} justifyContent={'center'} backgroundColor={'#4447'} >
                    <View alignItems={"stretch"} alignContent={'space-between'} style={{ padding: 25, margin: 25, borderRadius: 15 }} backgroundColor={"#ddd"} justifyContent={"center"} >
                        <Text style={styles.header} >Vehicles</Text>
                        {this.state.showConfirmDelete ?
                            <React.Fragment>
                                <Text>{this.state.confirmationMessage}</Text>
                                <View flexDirection={'row-reverse'} alignContent={'stretch'} justifyContent={'space-between'} >
                                    <Button iconRight={true} icon rounded block success onPress={this.deleteVehicle.bind(this, true)} >
                                        <Text>Yes</Text><Icon name="check" />
                                    </Button>
                                    <Button style={styles.footer} rounded icon block warning onPress={buton => { this.selected = null; props.closeDialog() }} >
                                        <Icon name={'close'} />
                                    </Button>
                                </View>
                            </React.Fragment> :
                            <React.Fragment>
                                <FlatList keyExtractor={(item) => item.vid} data={props.vehicles} renderItem={({ item }) => (
                                    <ListItem padding={2} fontSize={'0.8em'} >
                                        <Body style={{ display: 'flex' }} flexDirection={'row'}>
                                            <Text flex={1}>{`${item.vid}: ${item.color} ${item.brand} ${item.model} (${item.year})`}</Text>
                                            {item.user == props.user.username ? (
                                                <Button style={{ margin: 2 }} rounded icon danger onPress={() => { this.deleteSelected(item.vid, `Are you sure you want to delete ${item.brand} ${item.model} (${item.vid})?`) }} >
                                                    <Icon name={'close'} />
                                                </Button>) : null}
                                        </Body>

                                    </ListItem>
                                )}
                                    ListEmptyComponent={
                                        <View flex={1} alignContent={'stretch'} alignItems={'stretch'} flex={1} padding={'4'} flexDirection={'row'} justifyContent={'center'} >
                                            <Icon style={{ color: '#f88b', fontSize: 20 }} name={'alert'} />
                                            <Text style={{ textAlign: 'center', color: '#888b' }}> no car yet</Text>
                                        </View>
                                    } />
                                <View marginTop={2} flexDirection={'column'} alignContent={'stretch'} justifyContent={'center'} >
                                    <Button flex={1} style={styles.footer} rounded disabled={false} block danger onPress={buton => { props.closeDialog() }} >
                                        <Icon name={'close'} />
                                    </Button>
                                </View>
                            </React.Fragment>}
                    </View>
                </View>
            </Modal>
        )
    }
}
