import React from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ToastCloseButton } from './components';
import Core from './core';
import store from './redux/store';

import './locales';

import { getPersistor } from "@rematch/persist";
import { PersistGate } from "redux-persist/lib/integration/react";

const persistor = getPersistor();

const App = (): JSX.Element => (
	<Provider store={store}>
		<PersistGate persistor={persistor}>
			<Core />
			<ToastContainer closeButton={ToastCloseButton} hideProgressBar position="bottom-right" draggable={false} />
		</PersistGate>
	</Provider>
);

export default App;
