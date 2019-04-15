var mongoose = require("mongoose");

var userDetailsSchema = new mongoose.Schema({
    name: String,
    dob: Date, // date of birth
    address: String,
    kyc_document: String,
    kyc_id: String
});

module.exports = mongoose.model("UserDetail", userDetailsSchema);