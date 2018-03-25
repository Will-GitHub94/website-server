import forEach from "lodash/forEach";
import forOwn from "lodash/forOwn";
import map from "lodash/map";

import GitHubAPI from "./api/github";

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

function determineExtension(ext) {
	const imgExt = [
		"png",
		"jpeg",
		"jpg",
		"gif",
	];
	let extension = "markdown";

	if (imgExt.indexOf(ext.toLowerCase()) > -1) {
		extension = "img";
	}
	return extension;
}

async function buildKnowledgeSections() {
	console.log("==== buildKnowledgeSections =====");
	try {
		const knowledgeSections = {
			architecture: {},
			cryptography: {},
			machineLearning: {},
			networking: {},
		};
		const repoTree = await getTree();
		let extension = "";
		let extensionType = "markdown";

		forOwn(knowledgeSections, (value, key) => {
			knowledgeSections[key] = {
				img: [],
				md: [],
			};
		});

		forEach(repoTree, (node) => {
			forOwn(knowledgeSections, (value, key) => {
				if (node.path.indexOf(key) > -1 && node.path.indexOf(".") > -1) {
					extension = node.path.substr(node.path.indexOf(".") + 1, node.path.length);
					extensionType = determineExtension(extension);

					if (extensionType === "img") {
						knowledgeSections[key].img.push(node.path);
					} else {
						knowledgeSections[key].md.push(node.path);
					}
				}
			});
		});
		console.log("::: returning sections :::");
		return knowledgeSections;
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

async function getArchitectureFiles(knowledge) {
	const { architecture } = knowledge;

	architecture.img = await getFileContents(architecture.img);
	architecture.md = await getFileContents(architecture.md);

	return architecture;
}

async function getNetworkingFiles(knowledge) {
	const { networking } = knowledge;

	networking.img = await getFileContents(networking.img);
	networking.md = await getFileContents(networking.md);

	return networking;
}

async function getCryptographyFiles(knowledge) {
	const { cryptography } = knowledge;

	cryptography.img = await getFileContents(cryptography.img);
	cryptography.md = await getFileContents(cryptography.md);

	return cryptography;
}

async function getMachineLearningFiles(knowledge) {
	const { machineLearning } = knowledge;

	machineLearning.img = await getFileContents(machineLearning.img);
	machineLearning.md = await getFileContents(machineLearning.md);

	return machineLearning;
}

export default {
	getArchitectureFiles,
	getNetworkingFiles,
	getCryptographyFiles,
	getMachineLearningFiles,
	getREADMEContents,
	buildKnowledgeSections,
};
