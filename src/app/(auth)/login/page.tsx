import { signIn } from "~/auth";

export default function Login() {
	return (
		<a href="/api/auth/login">Signin with Google</a>
	);
}
