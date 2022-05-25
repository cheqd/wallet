/// <reference types="react-scripts" />

declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production' | 'test';
		PUBLIC_URL: string;
		RPC_ENDPOINT: string;
		REST_ENDPOINT: string;
		IDENTITY_ENDPOINT: string;
		IDENTITY_ENDPOINT: string;
	}
}
