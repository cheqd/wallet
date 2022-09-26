import React from 'react';
import { useSelector } from 'react-redux';
import { Route, BrowserRouter, Routes, redirect, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { RootState } from 'redux/store';
import { CreateWallet, Dashboard, Staking, Operations, Welcome, Governance, Identity, Error404 } from 'screens';
import MainLayout from './Layout/MainLayout/MainLayout';

const RootNavigator = (): JSX.Element => {
	return (
		<BrowserRouter>
			<MainLayout>
				<Routes>
					<Route path="/welcome" element={<Welcome />} />
					<Route path="/create" element={<CreateWallet />} />

					<Route element={<PrivateRoutes />}>
						<Route element={<Dashboard />} path='/home' />
						<Route element={<Operations />} path={'/operations'} />
						<Route element={<Staking />} path='/staking' />
						<Route element={<Governance />} path='/governance' />
						<Route element={<Governance />} path='/governance/proposal/:proposalId' />
						<Route element={<Identity />} path='/identity' />
						<Route element={<Dashboard />} path='/' />
					</Route>
					<Route element={<Error404 />} path="*" />
				</Routes>
			</MainLayout>
		</BrowserRouter>
	);
};

const PrivateRoutes = () => {
	const wallet = useSelector((state: RootState) => state.wallet.currentWallet);

	return (
		wallet ? <Outlet /> : <Navigate to='/welcome' />
	);
};

export default RootNavigator;
