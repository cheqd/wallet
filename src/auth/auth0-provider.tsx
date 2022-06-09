import React from 'react';
import { useHistory } from 'react-router-dom';
import { Auth0Provider as Auth0 } from '@auth0/auth0-react';

type Props = {
	children: JSX.Element
}
const Auth0Provider: React.FC<Props> = ({ children }) => {
	const domain = process.env.REACT_APP_AUTH0_DOMAIN;
	const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

	const history = useHistory();

	const onRedirectCallback = (appState: any) => {
		history.push(appState?.returnTo || window.location.pathname);
	};

	return (
		<Auth0
			domain={domain}
			clientId={clientId}
			redirectUri={window.location.origin + '/identity'}
			onRedirectCallback={onRedirectCallback}
		>
			{children}
		</Auth0>
	);
};

export default Auth0Provider;
