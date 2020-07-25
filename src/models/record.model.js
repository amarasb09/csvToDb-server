const mongoose = require('mongoose');

const RecordSchema = mongoose.Schema({
    recordId: Number,
    level: String,
    cvss: Number,
    vulnerability: Number,
    solution: Number,
    reference: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Record', RecordSchema);