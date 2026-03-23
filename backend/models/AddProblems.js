const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, index: true },
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
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Problems", problemSchema)