const mongoose = require('mongoose');

var validateEmail = function(email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email)
};


var User = mongoose.model('Users', {
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    minlength: 1,
    required: 'Email address is required',
    validate: [validateEmail, 'Please fill a valid email address'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  Age: {
    type: Number,
    default: null
  },
  PhoneNumber: {
    type: Number,
    default: null
  }
});

module.exports = {User};
