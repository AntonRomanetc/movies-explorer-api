const { celebrate, Joi } = require('celebrate');

const {
  isIdValid,
  strReq,
  numReq,
  urlReq,
} = require('../../utils/validators-consts');

module.exports.validateMovieData = celebrate({
  body: Joi.object().keys({
    country: strReq,
    director: strReq,
    duration: numReq,
    year: strReq,
    description: strReq,
    image: urlReq,
    trailerLink: urlReq,
    thumbnail: urlReq,
    movieId: numReq,
    nameRU: strReq,
    nameEN: strReq,
  }),
});

module.exports.validateMovieId = celebrate({
  params: Joi.object().keys({
    _id: isIdValid,
  }),
});
