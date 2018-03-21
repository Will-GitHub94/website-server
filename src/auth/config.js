import passport from "passport";

import GitHubAuth from "./github";

export default (app) => {
	console.log("auth config");
	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((id, done) => {
		done(null, id);
	});

	GitHubAuth();

	app.use(passport.initialize());
	app.use(passport.session());
};
