import './App.css';

// router
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// framer
import { AnimatePresence } from 'framer-motion';

// stores
import { useDialogStore } from './stores/dialogStore';

// main components
import MainPage from './components/MainPage';
import Modal from './components/Modal';
import Dialog from './components/Containment/Dialog';

// hooks
import useColorScheme from './hooks/useColorScheme';
import useAchievementsCheck from './hooks/useAchievementsCheck';

// db
import dbModalRoutes from './db/dbModalRoutes';
import SignInScreen from './components/SignIn';
import SignUpScreen from './components/SignUp';
import ResetPasswordScreen from './components/ResertPassword';
import AuthRedirectHandler from './components/AuthRedirect';
const PUBLIC_URL = process.env.PUBLIC_URL;

function App() {

	const location = useLocation();
	const isDialogVisible = useDialogStore((s) => s.isVisible);

	// Get colors from database based on settings or system theme
	useColorScheme();

	// Check achievements when dependencies change
	useAchievementsCheck();

	return (
		<main className="App">
			<AuthRedirectHandler />
			<AnimatePresence initial={false}>
				<Routes location={location} key={location.pathname}>
					<Route
						path='*'
						element={<Navigate to="/" />}
					/>

					<Route
						path="/"
						element={<MainPage />}
					/>
                    <Route
						path="/signup"
						element={<SignUpScreen />}
					/>
					<Route
						path="/signin"
						element={<SignInScreen />}
					/>
					<Route
						path="/resert"
						element={<ResetPasswordScreen />}
					/>
					<Route
						path="/modal"
						element={<Modal />}
					>
						{dbModalRoutes.map((r) => (
							<Route key={r.path} path={r.path} element={r.element} />
						))}
					</Route>
				</Routes>

				{isDialogVisible && (
					<Dialog key="dialog" />
				)}
			</AnimatePresence>
		</main>
	);
}

export default App;