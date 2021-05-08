const express = require("express");
const connect = require("../middleware/dbconnect");
const Messages = require("../models/message");

const router = express.Router();

router.route("/").get((req, res, next) => {
    connect.then(db => {
        Messages.find({}).then(msg => {
            res.json(msg);
        });
    });
});

module.exports = router;