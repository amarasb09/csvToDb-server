const express = require('express')
const router = express.Router()
const recordController = require('../controllers/record.controllers');
const multer = require('multer');
// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        try {
            let filename = file.fieldname + '-' + Date.now() + getExtension(file.originalname);
            cb(null, filename)
        } catch (error) {

        }
    }
})

function getExtension(filename) {
    let i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i);
}

var upload = multer({
    storage: storage
})

// Retrieve all users
router.get('/', recordController.findAll);
// Create a new user
router.post('/', recordController.create);
// Retrieve a single user with id
router.get('/:id', recordController.findOne);
// Upload a CSV file
router.post('/upload-csv', upload.single('csv'), recordController.uploadFile);
module.exports = router