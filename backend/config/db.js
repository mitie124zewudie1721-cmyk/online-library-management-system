// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // These options are no longer necessary in Mongoose 6+ / 7+, but kept for compatibility
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);

    } catch (error) {
        console.error(`Error: ${error.message}`.red.underline.bold);
        // Exit process with failure (in production you might want different behavior)
        process.exit(1);
    }
};

module.exports = connectDB;