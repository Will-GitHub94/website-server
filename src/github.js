import forEach from "lodash/forEach";
import forOwn from "lodash/forOwn";

import GitHubInteract from "./api/github/interact";

const buildKnowledgeStructure = () => {
	return {
		architecture: {
			img: [],
			md: [],
		},
		networking: {
			img: [],
			md: [],
		},
		cryptography: {
			img: [],
			md: [],
		},
		machineLearning: {
			img: [],
			md: [],
		},
	};
};

const determineExtension = (ext) => {
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
};

async function buildKnowledgeSections() {
	try {
		const knowledgeSections = buildKnowledgeStructure();
		const repoTree = await GitHubInteract.getTree();

		let extension = "";
		let extensionType = "markdown";

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

async function getKnowledgeFiles(knowledgeType, knowledge) {
	const type = knowledge[knowledgeType];

	type.paths = type.md;
	type.img = await GitHubInteract.getFileContents(type.img);
	type.md = await GitHubInteract.getFileContents(type.md);

	return type;
}

async function getREADMEFile() {
	return GitHubInteract.getREADMEContents();
}

export default {
	getKnowledgeFiles,
	getREADMEFile,
	buildKnowledgeSections,
};
