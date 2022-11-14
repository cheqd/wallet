import { createModel } from '@rematch/core';
import { IdentityWallet, RootModel } from '../../models';
import update from "immutability-helper";

export interface Claim {
    service: string;
    profileName: string;
    accessToken: string;
}

interface IdentityState {
    authToken: string | null;
    passphrase: string | null;
    claims: Claim[];
    wallet: IdentityWallet | null;
}

export const identity = createModel<RootModel>()({
    name: 'identity',
    state: {
        authToken: null,
        passphrase: null,
        claims: [],
        wallet: null,
    } as IdentityState,
    reducers: {
        setAuthToken(state, authToken: string) {
            return {
                ...state,
                authToken,
            };
        },
        setPassphrase(state, passphrase: string | null) {
            return {
                ...state,
                passphrase,
            };
        },
        addClaim(state, claim: Claim) {
            return {
                ...state,
                claims: [...state.claims, claim],
            };
        },
        removeClaim(state, claim: Claim) {
            return update(state, {
                claims: arr => arr.filter(c => c.service !== claim.service && c.profileName !== claim.profileName && c.accessToken !== claim.accessToken),
            });
        },
        setWallet(state, wallet: IdentityWallet | null) {
            return {
                ...state,
                wallet,
            };
        },
    },
});
