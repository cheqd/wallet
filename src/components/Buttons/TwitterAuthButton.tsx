import { useAuth0 } from "@auth0/auth0-react"
import Auth0SignIn from "./Auth0SignIn";
import Auth0SignOut from "./Auth0SignOut";

const Auth0Button = () => {
	const { isAuthenticated } = useAuth0();

	return isAuthenticated ? <Auth0SignOut /> : <Auth0SignIn />
}

export default Auth0Button;
