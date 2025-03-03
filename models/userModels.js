
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: { // Single field for full name as per the frontend form
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        default: null,
      },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    // confirm: {
    //     type: String,
    //     required: true
    // },
    pin: {
        type: Number,
        required: true
    },
    device: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0.0
    },
    fingerprint: {
         type: String,
          default: null 
    },
    
},{ timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;