import forOwn from "lodash/forOwn";
import forEach from "lodash/forEach";
// import map from "lodash/map";
import { Markdown, Image } from "./config";

const getImageTags = (openTag, contents) => {
	const imgTagIndices = [];
	const imgTags = [];
	let startIndex = 0;
	let index;

	while ((index = contents.indexOf(openTag, startIndex)) > -1) {
		imgTagIndices.push(index);
		startIndex = index + openTag.length;
	}

	forEach(imgTagIndices, (imgTagIndex) => {
		imgTags.push(contents.substring(imgTagIndex, contents.indexOf("/>")));
	});
	console.log(imgTags);
	return imgTags;
};

export default (knowledge) => {
	let convertedContents;
	let imgTags = [];

	forOwn(knowledge, (value, key) => {
		forEach(knowledge[key].imgs, (img) => {
			new Image({
				section: img.path.substring(0, img.path.indexOf("/")),
				contents: img.contents,
				path: img.path,
			}).save();
		});

		forEach(knowledge[key].mds, (md) => {
			convertedContents = Buffer.from(md.contents, "base64").toString("ascii");
			imgTags = getImageTags("src=", convertedContents);

			new Markdown({
				section: md.path.substring(0, md.path.indexOf("/")),
				path: md.path,
				contents: convertedContents,
				images: [],
			}).save();
		});
	});
};
