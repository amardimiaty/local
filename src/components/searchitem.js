import React, { PureComponent } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Icon, Text } from 'native-base';


export default class SearchItem extends PureComponent {

    render() {
        return (
            <TouchableOpacity onPress={() => { this.props.onPress(this.props.item) }} style={{padding: 4,overflow:"hidden"}} >
                <Text>
                    <Icon name={this.props.item.type.toLowerCase() !== "sedan" && this.props.item.type.toLowerCase() !== 'coupe' ? 'bus' : 'car'} color={this.props.item.type.toLowerCase() !== "sedan" && this.props.item.type.toLowerCase() !== 'coupe' ? 'green' : 'blue'} />
                    &emsp; {this.props.item.brand.concat(" ", this.props.item.model, " (", this.props.item.vid, ")")}
                </Text>
            </TouchableOpacity>
        )
    }

}
