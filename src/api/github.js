import axios from "axios";

export default () => {
	return axios.create({
		baseURL: `https://${process.env.GITHUB_API_URL}/repos/${process.env.GITHUB_USER_PROFILE}/my-knowledge`,
		headers: {
			Accept: `application/vnd.github.${process.env.GITHUB_API_VERSION}.raw`,
		},
		auth: {
			username: process.env.GITHUB_USER_PROFILE,
			password: process.env.GITHUB_USER_PASSWD,
		},
	});
};
