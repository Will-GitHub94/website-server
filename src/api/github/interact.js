import forEach from "lodash/forEach";
import forOwn from "lodash/forOwn";
import map from "lodash/map";

import GitHubAPI from "./config";
import saveKnowledge from "../../db/save";

/*
  This file serves holds all interactions with GitHub API
  The aim here is to get all knowledge files
  And to send them to services to save into the db
*/

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

// async function getREADMEContents() {
// 	try {
// 		return GitHubAPI().get("/contents/README.md")
//             .then((resp) => {
//                 saveFile(resp, "md", "README.md");
// 			})
// 			.catch((err) => {
// 				return err;
// 			});
// 	} catch (err) {
// 		return err;
// 	}
// }

async function buildKnowledgeContents(knowledgeFileArray) {
	try {
		const fileContents = [];

		await Promise.all(map(knowledgeFileArray, async (file) => {
			await GitHubAPI().get(`/contents/${file.path}`)
				.then((resp) => {
					file.contents = resp.data.content;
					fileContents.push(file);
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

const buildKnowledgeStructure = () => {
	return {
		architecture: {
			imgs: [],
			mds: [],
		},
		networking: {
			imgs: [],
			mds: [],
		},
		cryptography: {
			imgs: [],
			mds: [],
		},
		machineLearning: {
			imgs: [],
			mds: [],
		},
	};
};

async function buildKnowledgePaths() {
	console.log("\n===== buildKnowledgeSections =====");
	try {
		const knowledge = buildKnowledgeStructure();
		const repoTree = await getTree();
		let extension = "";
		let extensionType = "markdown";

		forEach(repoTree, (node) => {
			forOwn(knowledge, (value, key) => {
				if (node.path.indexOf(key) > -1 && node.path.indexOf(".") > -1) {
					extension = node.path.substr(node.path.indexOf(".") + 1, node.path.length);
					extensionType = determineExtension(extension);

					if (extensionType === "img") {
						knowledge[key].imgs.push({
							path: node.path,
						});
					} else if (extensionType === "markdown") {
						knowledge[key].mds.push({
							path: node.path,
						});
					}
				}
			});
		});
		return knowledge;
	} catch (err) {
		return err;
	}
}

async function initLocalKnowledgeStorage() {
	try {
		const knowledge = await buildKnowledgePaths();

		forOwn(knowledge, async (value, key) => {
			knowledge[key].imgs = await buildKnowledgeContents(value.imgs);
			knowledge[key].mds = await buildKnowledgeContents(value.mds);
		});
		saveKnowledge(knowledge);
	} catch (err) {
		return err;
	}
}

export default {
	initLocalKnowledgeStorage,
};
