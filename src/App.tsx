import React from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Auth0Provider from 'auth/auth0-provider';

import { ToastCloseButton } from './components';
import Core from './core';
import store from './redux/store';

import './locales';

const App = (): JSX.Element => (
    <Provider store={store}>
        {/*<Auth0Provider>*/}
            <Core/>
        {/*</Auth0Provider>*/}
        <ToastContainer closeButton={ToastCloseButton} hideProgressBar position="bottom-right" draggable={false}/>
    </Provider>
);

export default App;
