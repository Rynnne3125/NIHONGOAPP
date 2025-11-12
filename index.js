/**
 * @format
 */

import { AppRegistry } from 'react-native';
// Use the MainActivity React entry which initializes repositories and navigation
import MainActivity from './src/App/User/MainActivity';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => MainActivity);
