/// <reference types="vite/client" />

interface ImportMetaEnv {
	NODE_ENV: 'development' | 'production' | 'test';
	PUBLIC_URL: string;
	VITE_RPC_ENDPOINT: string;
	VITE_REST_ENDPOINT: string;
	VITE_STORAGE_ENDPOINT: string;
	VITE_ISSUER_ENDPOINT: string;
	VITE_AUTH0_DOMAIN: string;
	VITE_AUTH0_CLIENT_ID: string;
}

