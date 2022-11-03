import type {
    ICredentialPlugin,
    IDataStore,
    IDataStoreORM,
    IDIDManager,
    IKeyManager,
    IResolver,
    VerifiableCredential,
} from '@veramo/core'

import {DataSource} from 'typeorm'
import { createAgent } from '@veramo/core'
import { Entities, KeyStore, PrivateKeyStore, DIDStore, migrations } from '@veramo/data-store'
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'
import { KeyManager } from '@veramo/key-manager'
import { DIDManager } from '@veramo/did-manager'
import { KeyDIDProvider } from '@veramo/did-provider-key'
import { randomUUID } from 'crypto'

const DATA_BASE = 'database.sqlite'

const dbConnection = new DataSource({
  name: 'test1',
  type: 'sqlite',
  database: DATA_BASE,
  synchronize: false,
  migrations,
  migrationsRun: true,
  logging: ['error', 'info', 'warn'],
  entities: Entities
})

export type EnabledInterfaces = IDIDManager &
  IKeyManager &
  IDataStore &
  IDataStoreORM &
  IResolver &
  ICredentialPlugin 

export const agent = createAgent<EnabledInterfaces>({
  plugins: [
    new KeyManager({
        store: new KeyStore(dbConnection),
        kms: {
            local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox("7d4140d78e05691866c1dd2b4bda86b0b4d0e09eb86d5887faf089578ed5d7e8")))
        }
    }),
    new DIDManager({
      store: new DIDStore(dbConnection),
      defaultProvider: "did:key",
      providers: {
        "did:key": new KeyDIDProvider({ defaultKms: "local" })
      }
    }),
]
})

export async function createPresentation (did: string, credentials: VerifiableCredential[]) {
  return await agent.createVerifiablePresentation({
    presentation: {
    verifiableCredential: credentials,
    holder: did,
    nonce: randomUUID(),
    issuanceDate: new Date().toISOString()
  },
  proofFormat: 'jwt'
})
}
  