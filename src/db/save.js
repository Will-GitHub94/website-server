import forOwn from "lodash/forOwn";
import forEach from "lodash/forEach";
import { Markdown, Image } from "./connect";

export default (response, fileType, path) => {
    // save this into the db
    if (fileTypes === "img") {
        new Image({
            section: path.substring(0, path.indexOf("/")),
            path: path,
            contents: response.data.content,
        }).save();
    } else if (fileTypes === "md") {
        new Markdown({
            section: path.substring(0, path.indexOf("/")),
            path: path,
            contents: response.data.content,
        }).save();
    }
};