import type {
  ICredentialIssuer,
	IDIDManager,
	IKeyManager,
	MinimalImportableIdentifier,
	TKeyType
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
import { generateKeyPair } from '@stablelib/ed25519'
import { toString } from 'uint8arrays'
import Multibase from 'multibase';
import Multicodec from 'multicodec';

const memoryJsonStore = {
	notifyUpdate: () => Promise.resolve(),
}

export type EnabledInterfaces =  ICredentialIssuer & IDIDManager & IKeyManager

export const agent = createAgent<EnabledInterfaces>({
	plugins: [
		new KeyManager({
			store: new KeyStoreJson(memoryJsonStore),
			kms: {
				local: new KeyManagementSystem(new PrivateKeyStoreJson(memoryJsonStore, new SecretBox(import.meta.env.VITE_KMS_SECRET_KEY)))
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
    new CredentialIssuer(),
	]
})

export async function importDID(identifier: MinimalImportableIdentifier) {
	try {
		await agent.didManagerImport(identifier)
	} catch (error) {
		console.log(error)
	}
}

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

export async function createAndImportDID(keyPair: any){
	try {

		const did = `did:key:${Buffer.from(
			Multibase.encode('base58btc', Multicodec.addPrefix('ed25519-pub', Buffer.from(keyPair.publicKey))),
		).toString()}`

		const identifier: MinimalImportableIdentifier = {
			services: [],
			provider: 'did:key',
			did,
			alias: 'key-1',
			controllerKeyId: 'key-1',
			keys: [
				{
					kid: 'key-1',
					kms: 'local',
					type: <TKeyType>'Ed25519',
					publicKeyHex: keyPair.publicKey,
					privateKeyHex: keyPair.privateKey,
				}
			]
		}
		await importDID(identifier)
		return identifier
	} catch (error: any) {
		console.log(error)
		throw new Error(error)
	}
}

export function createKeyPairHex() {
    const keyPair = generateKeyPair()
    return {
        publicKey: toString(keyPair.publicKey, 'hex'),
        privateKey: toString(keyPair.secretKey, 'hex'),
    }
}
