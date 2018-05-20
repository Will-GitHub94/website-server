import forEach from "lodash/forEach";
import forOwn from "lodash/forOwn";
import map from "lodash/map";
import showdown from "showdown";

import GitHubInteract from "./api/github/interact";

const converter = new showdown.Converter();

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

const getImgTag = (fileContent, imgOpenTagIndex, imgCloseTagIndex) => {
	return fileContent.substring(imgOpenTagIndex, imgCloseTagIndex);
};

const getImgSrc = (imgTag) => {
	const imgSrcOpenTagIndex = (imgTag.indexOf("src=") + 5);
	const imgSrc = imgTag.substring(imgSrcOpenTagIndex, imgTag.indexOf('"', imgSrcOpenTagIndex));

	return removeImgSrcRelativity(imgSrc);
};

const getConvertedMdFiles = (mdFiles) => {
	return map(mdFiles, (mdFile) => {
		return {
			path: mdFile.path,
			content: converter.makeHtml(Buffer.from(mdFile.content, "base64").toString())
		};
	});
};

const removeImgSrcRelativity = (imgSrc) => {
	if (imgSrc.indexOf("..") > -1) {
		imgSrc.replace(/../g, "");
	}
	return imgSrc;
};

async function getKnowledgeFiles(knowledgeType, knowledge) {
	console.log("\n===== getKnowledgeFiles =====");
	const type = knowledge[knowledgeType];
	const imgFiles = await GitHubInteract.getFileContents(type.img);
	const mdFiles = await GitHubInteract.getFileContents(type.md);
	const newMdFiles = getConvertedMdFiles(mdFiles);

	let imgOpenTagIndex;
	let imgCloseTagIndex = 0;
	let imgTag = "";
	let imgSrc;
	let tagBeforeImgSrc = "";

	// imgOpenTagIndex = index of next image open tag
	// substr 2nd param is length of tag
	forEach(newMdFiles, (mdFile) => {
		while ((imgOpenTagIndex = mdFile.content.indexOf("<img", imgCloseTagIndex)) > -1) {
			imgCloseTagIndex = mdFile.content.indexOf("/>", imgOpenTagIndex);
			imgTag = getImgTag(mdFile.content, imgOpenTagIndex, imgCloseTagIndex);
			imgSrc = getImgSrc(imgTag);

			forEach(imgFiles, (imgFile) => {
				if (imgFile.path.toLowerCase().indexOf(imgSrc.toLowerCase()) > -1) {
					imgSrc = imgFile.content;
				}
			});
			tagBeforeImgSrc = (imgTag.indexOf("src=") + 4);
			tagBeforeImgSrc += imgSrc;
			mdFile.content.replace(imgTag);
		}
	});
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
