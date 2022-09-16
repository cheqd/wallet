/// <reference types="react-scripts" />

declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production' | 'test';
		PUBLIC_URL: string;
		REACT_APP_RPC_ENDPOINT: string;
		REACT_APP_REST_ENDPOINT: string;
		REACT_APP_STORAGE_ENDPOINT: string;
		REACT_APP_ISSUER_ENDPOINT: string;
		REACT_APP_AUTH0_DOMAIN: string;
		REACT_APP_AUTH0_CLIENT_ID: string;
	}
}
