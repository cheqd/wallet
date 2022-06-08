import { RematchDispatch, RematchRootState, init } from '@rematch/core';
import loadingPlugin, { ExtraModelsFromLoading } from '@rematch/loading';

import persistPlugin from "@rematch/persist";
import storage from "redux-persist/lib/storage";

import { RootModel, reduxModels } from 'models';

type FullModel = ExtraModelsFromLoading<RootModel, { type: 'full' }>;

const store = init<RootModel, FullModel>({
    models: reduxModels,
    redux: {
        rootReducers: {
            LOGOUT: () => undefined,
        },
    },
    plugins: [
        loadingPlugin({
            type: 'full'
        }),
        persistPlugin({
            key: "root",
            storage,
            whitelist: ['identity']
        })
    ],
});

export type Store = typeof store;
export type RootDispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel, FullModel>;

export default store;
