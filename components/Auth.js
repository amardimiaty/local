import React, { PureComponent } from 'react';
import { View, Text, Icon, Button, Input, Toast, Root, Item, CheckBox, Switch, Label } from 'native-base';
import { Slider, StatusBar, AsyncStorage, Alert, ToastAndroid, Modal, ScrollView, StyleSheet, BackPressEventName, ActivityIndicator, Vibration, BackHandler, Platform } from 'react-native';
import Expo, { Fingerprint } from 'expo';
import Local, { User, debounce } from './src/Local';
import { version } from './App';

export default class Splash extends Component {
}