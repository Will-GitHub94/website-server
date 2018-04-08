import forOwn from "lodash/forOwn";
import forEach from "lodash/forEach";
import { Markdown, Image } from "./config";

export default (knowledge) => {
	forOwn(knowledge, (value, key) => {
		forEach(knowledge[key].imgs, (img) => {
			new Image({
				section: img.path.substring(0, img.path.indexOf("/")),
				contents: img.contents,
				path: img.path,
			}).save();
		});

		forEach(knowledge[key].mds, (md) => {
			new Markdown({
				section: md.path.substring(0, md.path.indexOf("/")),
				path: md.path,
				contents: md.contents,
			}).save();
		});
	});
};
