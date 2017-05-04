import React from 'react';
import {
  Button,
  Text,
  View
} from 'react-native';
import { Provider } from 'mobx-react';

import { scene, NavContainer, NavTab } from '../..';
import './CachedScene';
import './ComplexScene';

import DeepLink from './DeepLink';

import { Tab1 } from './TabOne';
import { Tab2 } from './TabTwo';
import { Tab3 } from './TabThree';

const TestScene = scene('TestScene')((props) => {
  const onPress = () => {
    props.navState.push('TestScene2');
  };

  const onPress2 = () => {
    props.navState.replace('TestScene3');
  };

  const onPress3 = () => {
    props.navState.tabs();
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'orange' }}>
      <Button title={props.text} onPress={onPress} />
      <Button title={'Test replace'} onPress={onPress2} />
      <Button title={'Tabs!'} onPress={onPress3} />
    </View>
  )
});
TestScene.navConfig = {
  // Root scenes are housed on the root stack prior to the existence of the tab bar
  isRootScene: true
};

const TestScene2 = scene('TestScene2')((props) => {
  const onPress = () => {
    props.navState.pop();
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Button title={'Test 2'} onPress={onPress} />
    </View>
  )
});
TestScene2.navConfig = {
  tabBarVisible: true,
}

const TestScene3 = scene('TestScene3')((props) => {
  const onPress = () => {
    props.navState.push('TestScene', { text: 'came from 3' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'orange' }}>
      <Button title={'Test 3'} onPress={onPress} />
    </View>
  )
});

const TabCommon = (props) => {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Button title={'Tab Common'} onPress={onPress} />
    </View>
  );
}

const testStore = {
  data: 'hello',
};

const testTemplate = {
  cardStyle: {
    backgroundColor: 'grey',
  },
};

const secondTemplate = {
  navBarStyle: {
    backgroundColor: 'grey',
  },
};

export default class Root extends React.Component {
  render() {
    return (
      <Provider testStore={testStore}>
        <NavContainer
          templates={{
            test: testTemplate,
            test2: secondTemplate,
          }}
          initialScene={TestScene}
          initialProps={{ text: 'hello world' }}
          logLevel={0}
        >
          <NavTab initialScene={Tab1} name={'1'} isInitial />
          <NavTab initialScene={Tab2} name={'2'} />
          <NavTab initialScene={Tab3} name={'3'} initialProps={{ color: 'red' }} />
          <NavTab initialScene={DeepLink} name={'4'} />
        </NavContainer>
      </Provider>
    )
  }
}