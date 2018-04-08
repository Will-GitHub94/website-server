import forEach from "lodash/forEach";
import forOwn from "lodash/forOwn";
import map from "lodash/map";

import GitHubAPI from "./api/github";
import saveFile from "./db/save";

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
	console.log("\n===== buildKnowledgeSections =====");
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

		// Just adding array properties to each section
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

async function getFileContents(paths, fileType) {
	console.log("\n===== getFileContents =====");
	try {
		const fileContents = []

		await Promise.all(map(paths, async (path) => {
			await GitHubAPI().get(`/contents/${path}`)
				.then((resp) => {
					saveFile(resp, fileType, path);
					// fileContents.push(resp.data.content);
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

async function getKnowledgeFiles(knowledgeType, knowledge) {
	console.log("\n===== getKnowledgeFiles =====");
	console.log(knowledge);
	const type = knowledge[knowledgeType];

	type.paths = type.md;
	type.img = await getFileContents(type.img, "img");
	type.md = await getFileContents(type.md, "md");

	console.log("::: paths :::");
	console.log(type.paths);
	return type;
}

export default {
	getREADMEContents,
	buildKnowledgeSections,
	getKnowledgeFiles,
};
