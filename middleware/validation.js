const {check, validationResult} = require('express-validator');
const User = require('../models/User')

exports.validateUser =
 [ 
    check('name')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('User name can not be empty!')
    .bail()
    .isLength({min: 3})
    .withMessage('Minimum 3 characters required!')
    .bail(),
  check('email')
    .trim()
    .normalizeEmail()
    .not()
    .isEmpty()
    .withMessage('Invalid email address!')
    .bail()
    .custom((value, {req}) => {   // value is for the email, as email is mention in the check
        //if (value === 'test@test.com') {
          //  throw new Error('This email address is forbidden')
       // }
        //return true     // have its reason
        return User.findOne({email: value})
            .then(userDoc => {  //asyn validator
                if (userDoc) {
                return Promise.reject('E-mail exists already, please pick a different one') //every then block returns a promise
                }
            })
        }),
        (req,res,next) => {
            const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            const error = new Error('validation failed')
            error.statusCode = 303
            error.data = errors.array()
            throw error
        }
        next()
        }
        
]


exports.validateLogin = [
  check('email')
    .trim()
    .normalizeEmail()
    .not()
    .isEmpty()
    .withMessage('Email is required!')
    .bail()
    .isEmail()
    .withMessage('Please enter a valid email address!'),

  check('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Password is required!')
    .bail()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long!'),

  // Final validation error handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    next();
  }
];
