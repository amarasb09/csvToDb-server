const Record = require('../models/record.model');
const csv = require('csvtojson');
var path = require('path');
// Retrieve and return all records from the database.
exports.findAll = (req, res) => {
    Record.find()
        .then(records => {
            res.send(records);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Something went wrong while getting list of records."
            });
        });
};
// Create and Save a new Record
exports.create = (req, res) => {
    // Validate request
    if (!req.body) {
        return res.status(400).send({
            message: "Please fill all required field"
        });
    }
    // Create a new Record
    const record = new Record({
        recordId: req.body.id,
        level: req.body.level,
        cvss: req.body.cvss ? req.body.cvss : null,
        vulnerability: req.body.vulnerability ? req.body.vulnerability : null,
        solution: req.body.solution ? req.body.solution : null,
        reference: req.body.reference ? req.body.reference : null
    });
    // Save record in the database
    record.save()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Something went wrong while creating new record."
            });
        });
};


// Find a single Record with a id
exports.findOne = (req, res) => {
    Record.findById(req.params.id)
        .then(record => {
            if (!record) {
                return res.status(404).send({
                    message: "Record not found with id " + req.params.id
                });
            }
            res.send(record);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Record not found with id " + req.params.id
                });
            }
            return res.status(500).send({
                message: "Error getting record with id " + req.params.id
            });
        });
};

// Retrieve and return all records from the database.
exports.uploadFile = async (req, res) => {
    try {
        const file = req.file
        if (!file) {
            return res.status(404).send({
                message: "No File Selected "
            });
        }
        const jsonArray = await convertCSVToJSON(path.join(__dirname, "../../", file.path));
        let validData = [];
        let inValidData = [];
        jsonArray.map(item => {
            if (item.id && item.level) {
                try {
                    let vulnerability = item.Vulnerability ? Number(item.Vulnerability.split('-')[1].trim()) : null;
                    let solution = item.Solution ? Number(item.Solution.split('-')[1].trim()) : null;
                    let reference = item.reference ? Number(item.reference.split('-')[1].trim()) : null;

                    if (!vulnerability) {
                        vulnerability = item.vulnerability ? Number(item.vulnerability.split('-')[1].trim()) : null;
                    }

                    if (!solution) {
                        solution = item.solution ? Number(item.solution.split('-')[1].trim()) : null;
                    }

                    if (!reference) {
                        reference = item.Reference ? Number(item.Rulnerability.split('-')[1].trim()) : null;
                    }

                    const record = new Record({
                        recordId: item.id,
                        level: item.level,
                        cvss: item.cvss ? item.cvss : null,
                        vulnerability: vulnerability > 0 ? vulnerability : null,
                        solution: solution > 0 ? solution : null,
                        reference: reference > 0 ? reference : null
                    });
                    validData.push(record);
                } catch (error) {
                    inValidData.push(item);
                }
            } else {
                inValidData.push(item);
            }
        });
        if (inValidData.length === 0 && validData.length > 0) {
            // Save record in the database
            Record.insertMany(validData)
                .then(data => {
                    return res.send(data);
                }).catch(err => {
                    return res.status(500).send({
                        message: err.message || "Something went wrong while creating new record.",
                        data: inValidData
                    });
                });
        } else {
            return res.status(500).send({
                message: "File records are not properly formatted! Try again with properly formmated file."
            });
        }
    } catch (error) {
        return res.status(500).send({
            message: "Something went wrong while processing the CSV File."
        });
    }

};


async function convertCSVToJSON(csvFilePath) {
    try {
        const jsonArray = await csv().fromFile(csvFilePath, {
            encoding: 'utf8'
        });
        return jsonArray;
    } catch (error) {
        console.log("..error.......convertCSVToJSON", error);
    }
}