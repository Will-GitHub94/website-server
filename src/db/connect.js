import mongoose, { mongo } from "mongoose";

const Schema = new mongoose.Schema;

mongoose.connect(`mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`, {
    autoIndex: false,
});

const markdownSchema = new Schema({
    section: String,
    title: String,
    author: {
        type: String,
        default: "Will Ashworth",
    },
    contents: String,
    path: String,
    links: Array,
    images: Array,
});

const imageSchema = new Schema({
    section: String,
    markdownFile: ObjectId,
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