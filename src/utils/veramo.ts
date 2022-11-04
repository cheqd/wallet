import type {
  ICredentialIssuer,
	IDIDManager,
	IKeyManager
  } from '@veramo/core'

import { createAgent } from '@veramo/core'
import { DataStoreJson, DIDStoreJson, KeyStoreJson, PrivateKeyStoreJson } from '@veramo/data-store-json'
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'
import { KeyManager } from '@veramo/key-manager'
import { DIDManager } from '@veramo/did-manager'
import { KeyDIDProvider } from '@veramo/did-provider-key'
import { Credential } from '../models'
import { v4 as uuid } from 'uuid'
import { CredentialIssuer } from '@veramo/credential-w3c'

const memoryJsonStore = {
	notifyUpdate: () => Promise.resolve(),
}

export type EnabledInterfaces =  ICredentialIssuer & IDIDManager & IKeyManager

export const agent = createAgent<EnabledInterfaces>({
	plugins: [
		new KeyManager({
			store: new KeyStoreJson(memoryJsonStore),
			kms: {
				local: new KeyManagementSystem(new PrivateKeyStoreJson(memoryJsonStore, new SecretBox("7d4140d78e05691866c1dd2b4bda86b0b4d0e09eb86d5887faf089578ed5d7e8")))
			}
		}),
		new DIDManager({
			store: new DIDStoreJson(memoryJsonStore),
			defaultProvider: "did:key",
			providers: {
				"did:key": new KeyDIDProvider({ defaultKms: "local" })
			}
		}),
		new DataStoreJson(memoryJsonStore),
    new CredentialIssuer()
	]
})

export async function createPresentation(did: string, credentials: Credential[]) {
	return await agent.createVerifiablePresentation({
		presentation: {
			verifiableCredential: credentials,
			holder: did,
			nonce: uuid(),
			issuanceDate: new Date().toISOString()
		},
		proofFormat: 'jwt'
	})
}

