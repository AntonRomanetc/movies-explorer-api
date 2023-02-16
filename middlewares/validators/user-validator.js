const { celebrate, Joi } = require('celebrate');

const {
  strReq,
  emailReq,
} = require('../../utils/validators-consts');

module.exports.validateUserRegInfo = celebrate({
  body: Joi.object().keys({
    email: emailReq,
    password: strReq,
    name: strReq.min(2).max(30),
  }),
});

module.exports.validateUserAuthInfo = celebrate({
  body: Joi.object().keys({
    email: emailReq,
    password: strReq,
  }),
});

module.exports.validateUserInfo = celebrate({
  body: Joi.object().keys({
    email: emailReq,
    name: strReq.min(2).max(30),
  }),
});
