const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose'); // require passport-local-mongoose package to use it as a 
// plugin in the User schema below to add username and password fields to the User schema and to hash and salt the password.

 const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
 });

 userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);