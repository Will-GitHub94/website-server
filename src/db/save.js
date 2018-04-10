import forOwn from "lodash/forOwn";
import forEach from "lodash/forEach";
import map from "lodash/map";
import { Markdown, Image } from "./config";

const getImageTags = (openTag, contents) => {
	const imgTags = [];

	let imgOpenTagIndex;
	let imgCloseTagIndex = 0;
	let imgTagLength;

	// imgOpenTagIndex = index of next image open tag
	// substr 2nd param is length of tag
	while ((imgOpenTagIndex = contents.indexOf(openTag, imgCloseTagIndex)) > -1) {
		imgCloseTagIndex = contents.indexOf("/>", imgOpenTagIndex);
		imgTagLength = ((imgCloseTagIndex - imgOpenTagIndex) + 2);
		imgTags.push(contents.substr(imgOpenTagIndex, imgTagLength));
	}
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
			imgTags = getImageTags("<img", convertedContents);

			new Markdown({
				section: md.path.substring(0, md.path.indexOf("/")),
				path: md.path,
				contents: convertedContents,
				images: map(imgTags, (imgTag) => {
					const srcStartIndex = (imgTag.indexOf('src="') + 5);
					const srcEndIndex = imgTag.indexOf('"', srcStartIndex);

					return imgTag.substring(srcStartIndex, srcEndIndex);
				}),
			}).save();
		});
	});
};
