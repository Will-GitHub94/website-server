import mongoose from "mongoose";

const { Schema } = mongoose;

const markdownSchema = new Schema({
	section: String,
	title: String,
	author: {
		type: String,
		default: "Will Ashworth",
	},
	contents: String,
	path: String,
	images: Array,
});

const imageSchema = new Schema({
	section: String,
	contents: String,
});

const Markdown = mongoose.model("Markdown", markdownSchema);
const Image = mongoose.model("Image", imageSchema);

// Exporting the models but these still need to be
// instantiated into documents before can be saved
export {
	Markdown,
	Image,
};
