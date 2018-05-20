import forEach from "lodash/forEach";
import forOwn from "lodash/forOwn";
import map from "lodash/map";
import showdown from "showdown";
import find from "lodash/find";
import replace from "lodash/replace";

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
	console.log("\n===== getImgSrc =====");
	const imgSrcOpenTagIndex = (imgTag.indexOf("src=") + 5);
	const imgSrc = imgTag.substring(imgSrcOpenTagIndex, imgTag.indexOf('"', imgSrcOpenTagIndex));
	console.log(`::: imgSrc: ${imgSrc}`);

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
	console.log("\n===== removeImgSrcRelativity =====");
	console.log(`::: contain?: ${imgSrc.indexOf("..") > -1}`);
	if (imgSrc.indexOf("..") > -1) {
		imgSrc = replace(imgSrc, /../g, "");
	}
	console.log(`::: imgSrc: ${imgSrc}`);
	return imgSrc;
};

const getMatchingImageFile = (imgFiles, imgSrc) => {
	return find(imgFiles, (imgFile) => {
		console.log(`::: imgFile path: ${imgFile.path}`);
		console.log(`::: imgSrc: ${imgSrc}`);
		return (imgFile.path.toLowerCase().indexOf(imgSrc.toLowerCase()) > -1);
	});
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
	let imgSrcAttrIndex = "";
	let tagBeforeImgSrc = "";
	let tagAfterImgSrc = "";
	let newImgTag = "";
	let matchingImgFile;

	// imgOpenTagIndex = index of next image open tag
	// substr 2nd param is length of tag
	forEach(newMdFiles, (mdFile) => {
		while ((imgOpenTagIndex = mdFile.content.indexOf("<img", imgCloseTagIndex)) > -1) {
			imgCloseTagIndex = mdFile.content.indexOf("/>", imgOpenTagIndex);
			imgTag = getImgTag(mdFile.content, imgOpenTagIndex, imgCloseTagIndex);
			imgSrc = getImgSrc(imgTag);

			console.log("::: not set :::\n");
			matchingImgFile = getMatchingImageFile(imgFiles, imgSrc);
			console.log("\n::: set :::");

			imgSrc = matchingImgFile.content;

			console.log("::: setting new image tag :::");
			console.log(`::: imgTag: ${imgTag}`);
			imgSrcAttrIndex = (imgTag.indexOf("src=") + 5);
			tagBeforeImgSrc = imgTag.substring(0, imgSrcAttrIndex);
			console.log(`::: tagBeforeImgSrc: ${tagBeforeImgSrc}`);
			tagAfterImgSrc = imgTag.substring((imgTag.indexOf('"', imgSrcAttrIndex), imgTag.length));
			console.log(`::: tagAfterImgSrc: ${tagAfterImgSrc}`);
			console.log(`::: imgSrc: ${imgSrc}`);
			newImgTag = (tagBeforeImgSrc + imgSrc + tagAfterImgSrc);
			console.log(`::: newImgTag: ${newImgTag}`);
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
