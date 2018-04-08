import mongoose from "mongoose";

// Initialize Mongoose
const connect = (cb) => {
	mongoose
		.connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`, {
			autoIndex: false,
		})
		.then((conn) => {
			if (cb) {
				cb(conn);
			}
		})
		.catch((err) => {
			console.error("Could not connect to MongoDB!");
			console.log(err);
		});

};

const disconnect = (cb) => {
	mongoose.connection.db
		.close((err) => {
			console.info("Disconnected from MongoDB.");
			return cb(err);
		});
};

export default {
	connect,
	disconnect,
};
