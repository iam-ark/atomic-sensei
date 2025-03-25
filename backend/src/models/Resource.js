const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
    title: String,
    url: String,
    type: { type: String, enum: ["text", "video"] },
    source: String,
    createdAt: { type: Date, default: Date.now },
});

const Resource = mongoose.models.Resource || mongoose.model("Resource", resourceSchema);
module.exports = Resource;
