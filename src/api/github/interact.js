import map from "lodash/map";

import GitHubAPI from "./config";

async function getLatestSha() {
	return GitHubAPI().get("/git/refs/heads/master")
		.then((resp) => {
			return resp.data.object.sha;
		})
		.catch((err) => {
			return err;
		});
}

async function getTree() {
	try {
		const latestSha = await getLatestSha();

		return GitHubAPI().get(`/git/trees/${latestSha}`, {
			params: {
				recursive: 1,
			},
		})
			.then((resp) => {
				return resp.data.tree;
			})
			.catch((err) => {
				return err;
			});
	} catch (err) {
		return err;
	}
}

async function getREADMEContents() {
	try {
		return GitHubAPI().get("/contents/README.md")
			.then((resp) => {
				return resp.data.content;
			})
			.catch((err) => {
				return err;
			});
	} catch (err) {
		return err;
	}
}

async function getFileContents(paths) {
	try {
		const fileContents = [];

		await Promise.all(map(paths, async (path) => {
			await GitHubAPI().get(`/contents/${path}`)
				.then((resp) => {
					fileContents.push(resp.data.content);
				})
				.catch((err) => {
					return err;
				});
		}));
		return fileContents;
	} catch (err) {
		return err;
	}
}

export default {
	getTree,
	getREADMEContents,
	getFileContents,
};
