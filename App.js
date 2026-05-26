import React from 'react';
import {Provider} from 'react-redux';

import {store} from './src/redux/store';
import AppNavigator from './src/components/navigation/AppNavigator';
import {StripeProvider} from '@stripe/stripe-react-native';

export default function App() {
  return(
  <StripeProvider
      publishableKey="pk_test_51T46Hw5z5Fws9AW6craK38HwOGabeoYLNDd6jktLQ52OL1DyDwFo7QlGaJ7jHLJmtnZDxILYrdnkoqSmraG71E2y000Q2XSJ9H"
    >

      <Provider store={store}>

        <AppNavigator/>

      </Provider>

    </StripeProvider>
  );
}