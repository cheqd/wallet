import React from 'react';
import { useSelector } from 'react-redux';
import { Switch, Route, BrowserRouter, Redirect } from 'react-router-dom';
import { RootState } from 'redux/store';
import { CreateWallet, Dashboard, Staking, Operations, Welcome, Governance, Identity, Error404 } from 'screens';
import MainLayout from './Layout/MainLayout/MainLayout';

const RootNavigator = (): JSX.Element => {
    return (
        <BrowserRouter>
            <MainLayout>
                <Switch>
                    <Route path="/welcome">
                        <Welcome/>
                    </Route>
                    <Route path="/create">
                        <CreateWallet/>
                    </Route>
                    <PrivateRoute exact path={['/home', '/']}>
                        <Dashboard/>
                    </PrivateRoute>
                    <PrivateRoute exact path="/operations">
                        <Operations/>
                    </PrivateRoute>
                    <PrivateRoute exact path="/staking">
                        <Staking/>
                    </PrivateRoute>
                    <PrivateRoute exact path={['/governance', '/governance/proposal/:proposalId']}>
                        <Governance/>
                    </PrivateRoute>
                    <PrivateRoute exact path="/identity">
                        <Identity/>
                    </PrivateRoute>
                    <Route path="*">
                        <Error404/>
                    </Route>
                </Switch>
            </MainLayout>
        </BrowserRouter>
    );
};

const PrivateRoute = ({
                          children,
                          path,
                          exact,
                      }: {
    children: React.ReactNode;
    exact?: boolean;
    path: string | string[];
}): JSX.Element => {
    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);

    return (
        <Route exact={exact} path={path}>
            {wallet ? children : <Redirect to="/welcome"/>}
        </Route>
    );
};

export default RootNavigator;
