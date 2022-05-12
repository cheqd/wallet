/// <reference types="react-scripts" />

declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production' | 'test';
		PUBLIC_URL: string;
		REACT_APP_RPC_URL: string;
		REACT_APP_API_URL: string;
		REACT_APP_ISSUER_URL: string;
		REACT_APP_STORAGE_URL: string;
	}
}
