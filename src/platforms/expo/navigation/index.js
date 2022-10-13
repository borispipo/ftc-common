import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNavigationContainerRef } from '@react-navigation/native';

const nav = createNavigationContainerRef();
export const navigationRef = {
    get current (){
        return nav;
    }
}

export const Stack = createNativeStackNavigator();