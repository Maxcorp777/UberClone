import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen'
import PaymentScreen from '../screens/PaymentScreen'

const Stack = createNativeStackNavigator();

export default function AppNavigator(){
    return(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                name = "Home"
                component={HomeScreen}
                >
                </Stack.Screen>
                <Stack.Screen
                name = "Payment"
                component = {PaymentScreen}
                >

                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    )
}