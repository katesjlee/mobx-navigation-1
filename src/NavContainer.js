import React from 'react';
import {
  BackHandler,
  Platform,
  StyleSheet,
  View,
  ViewPropTypes,
} from 'react-native';
import { observer, Provider } from 'mobx-react';
import { autorun, observable } from 'mobx';
import PropTypes from 'prop-types';

import { NavState, mergeValues } from './models/NavState';
import NavTabBar from './NavTabBar';
import NavCard from './NavCard';

import Log from './Logger';

const TransitionState = {
  NONE: 0,
  PUSH: 1,
  POP: 2,
};

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;

export const defaultConfig = {
  // You are free to put any data in here that you like and the library will merge the contents
  // for you as appropriate. It may be accessed through the navState
  custom: {},

  navBarVisible: false,
  tabBarVisible: false,
  cardStyle: {
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    position: 'absolute',
    backgroundColor: 'white',
  },
  initNavProps: null,
  navBarStyle: {
    backgroundColor: 'white',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#828287',
    height: 68 - STATUSBAR_HEIGHT,
  },
  navBarBackImage: null,
  navBarBackImageStyle: {
    width: 13,
    height: 21,
  },
  navBarCenter: null,
  navBarCenterProps: null,
  navBarCenterStyle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: STATUSBAR_HEIGHT,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  navBarLeftDisabled: false, // Remove default back button
  navBarLeft: null,
  navBarLeftProps: null,
  navBarLeftStyle: {
    position: 'absolute',
    justifyContent: 'center',
    paddingTop: STATUSBAR_HEIGHT,
    width: 100,
    top: 0,
    left: 0,
    bottom: 0,
    paddingLeft: 15,
  },
  navBarRight: null,
  navBarRightProps: null,
  navBarRightStyle: {
    position: 'absolute',
    justifyContent: 'center',
    paddingTop: STATUSBAR_HEIGHT,
    width: 100,
    top: 0,
    right: 0,
    bottom: 0,
    paddingRight: 15,
  },
  navBarTitleStyle: {
    alignItems: 'center',
  },
  navBarSubtitleStyle: {

  },
  navBarTransparent: false,
  statusBarStyle: 'default', // One of default, light-content, or dark-content
  tabBarStyle: {
    height: 50,
  },
  tabBarTransparent: false,
  logLevel: Log.Level.WARNING,
  unique: false,
}

let navInstanceExists = false;

// Top level container for all navigation elements and scenes
@observer
export default class NavContainer extends React.Component {
  static propTypes = {
    cardStyle: ViewPropTypes.style,
    navBarStyle: ViewPropTypes.style,
    tabStyle: ViewPropTypes.style,
    logLevel: PropTypes.number,
  };

  @observable width = 0;
  @observable height = 0;

  constructor(props) {
    super(props);
    const config = { ...props };
    Object.keys(defaultConfig).forEach((key) => {
      config[key] = mergeValues(defaultConfig[key], config[key]);
    });
    // Unset templates and cacheWatermark as these are not scene configuration values
    config.templates = undefined;
    config.cacheWatermark = undefined;
    const cacheWatermark = props.cacheWatermark ? props.cacheWatermark : 8;

    this.navState = new NavState(config, props.templates, cacheWatermark);
    if (typeof props.navStateRef === 'function') {
      props.navStateRef(this.navState);
    }

    Log.debug('Initializing nav container with configuration: ', config);
  }

  componentWillMount() {
    if (navInstanceExists) {
      throw new Error('You are attempting to create multiple instances of the nav container');
    }
    navInstanceExists = true;
    BackHandler.addEventListener('hardwareBackPress', () => {
      if (this.navState.front.previous) {
        this.navState.pop();
        return true;
      }
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress');
    navInstanceExists = false;
  }

  cards() {
    return this.navState.elementPool.orderedElements().map(
      element => <NavCard
        navState={this.navState}
        key={element.key}
        element={element}
        height={this.height}
        width={this.width}
      />);
  }

  containerOnLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    this.width = width;
    this.height = height;
  };

  render() {
    return (
      <Provider navState={this.navState}>
        <View
          style={{ flex: 1 }}
          onLayout={this.containerOnLayout}
        >
          {this.cards()}
          <NavTabBar navState={this.navState} style={this.props.tabStyle} height={this.height} width={this.width}>
            {this.props.children}
          </NavTabBar>
        </View>
      </Provider>
    );
  }
}
