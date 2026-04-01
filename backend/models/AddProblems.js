const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
    userId: {type: String, required: true, index: true},
    title: String,
    description: String,
    topic: String,
    language: String,
    difficulty: String,
    notes: String,
    code: String,
    solutions: [{
        title: String,
        language: String,
        code: String
    }],
    references: [String],
    clerkId: { type: String, required: true, index: true },
}, { timestamps: true })

module.exports = mongoose.model("Problems", problemSchema)