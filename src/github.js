import forEach from "lodash/forEach";
import forOwn from "lodash/forOwn";
import filter from "lodash/filter";

import GitHubAPI from "./auth/github";


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

async function buildKnowledgeSections() {
	try {
		const knowledgeSections = {
			architecture: [],
			cryptography: [],
			machineLearning: [],
			networking: [],
		};
		const repoTree = await getTree();

		forEach(repoTree, (node) => {
			forOwn(knowledgeSections, (value, key) => {
				// 2nd condition checking if file
				if (node.path.indexOf(key) > -1 && node.path.indexOf(".") > -1) {
					knowledgeSections[key].push(node.path);
				}
			});
		});
		return knowledgeSections;
	} catch (err) {
		return err;
	}
}

async function getArchitectureFiles() {
	const { architecture } = await buildKnowledgeSections();

	return filter(architecture, (path) => {
		return GitHubAPI().get(`/contents/${path}`)
			.then((resp) => {
				return resp;
			})
			.catch((err) => {
				return err;
			});
	});
}

const getNetworkingFiles = () => {
	const networkingPaths = buildKnowledgeSections().networking;
	const networkingFiles = [];

	forEach(networkingPaths, (path) => {
		networkingFiles.push(GitHubAPI().get(`/contents/${path}`));
	});
	return networkingFiles;
};

const getCryptographyFiles = () => {
	const cryptographyPaths = buildKnowledgeSections().networking;
	const cryptographyFiles = [];

	forEach(cryptographyPaths, (path) => {
		cryptographyFiles.push(GitHubAPI().get(`/contents/${path}`));
	});
	return cryptographyFiles;
};

const getMachineLearningFiles = () => {
	const machineLearningPaths = buildKnowledgeSections().machineLearning;
	const machineLearningFiles = [];

	forEach(machineLearningPaths, (path) => {
		machineLearningFiles.push(GitHubAPI().get(`/contents/${path}`));
	});
	return machineLearningFiles;
};

export default {
	getArchitectureFiles,
	getNetworkingFiles,
	getCryptographyFiles,
	getMachineLearningFiles,
};
