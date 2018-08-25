const validator = require('validator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email.'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      require: true
    }
  }]
});

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  return _.pick(userObject, ['_id', 'email']);
}

UserSchema.methods.generateAuthToken = function () {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({ _id: user._id.toHexString(), access}, 'somesecret');
  user.tokens = [{access, token}];
  return user.save().then((user) => {
    return token;
  })
}

UserSchema.statics.findByCredentials = function (data) {
  let username = getUserField();
  const User = this;
  return User.findOne({ email: data.email }).then((user) => {
        if(!user) {
          return Promise.reject();
        }
        return new Promise((resolve, reject) => {
          bcrypt.compare(data.password, user.password, (err, result) => {
            if(!result) {
              return reject();
            }
            return resolve(user);
          });
        });
      });
}


const getUserField = () => {
  return 'email';
}

UserSchema.statics.findByToken = function (token) {
  const User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, 'somesecret');
  } catch(e) {
    // return new Promise((resolve, reject) => {
    //   reject();
    // });
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.access': 'auth',
    'tokens.token': token
  });

}


UserSchema.pre('save', function (next) {
  const user = this;

  if(user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }

});

const User = mongoose.model('User', UserSchema);


module.exports = { User }