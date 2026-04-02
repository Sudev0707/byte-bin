const mongoose = require("mongoose");


// 
const problemSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    topic: { type: String, required: true },
    language: { type: String, required: true },
    difficulty: { type: String, required: true, enum: ["Easy", "Medium", "Hard"] },
    notes: { type: String, default: "" },
    code: { type: String, default: "" },
    solutions: [{
        title: { type: String, required: true },
        language: { type: String, required: true, default: "JavaScript" },
        code: { type: String, required: true }
    }],
    references: [{ type: String, trim: true }],
    dateAdded: { type: String, default: () => new Date().toISOString().split('T')[0] }

}, { timestamps: true })


//
problemSchema.index({ userId: 1, title: 1 }, { unique: true })
problemSchema.index({ userId: 1, topic: 1 })
problemSchema.index({ userId: 1, difficulty: 1 })

// Virtual for frontend compatibility
problemSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

// check ownership
problemSchema.methods.isOwnedBy = function (userId) {
    return this.userId.toString() === userId.toString();
}


module.exports = mongoose.model("Problems", problemSchema)