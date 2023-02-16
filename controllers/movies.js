const Movie = require('../models/movie');
const {
  OK_STATUS,
  CREATED_STATUS,
  BAD_REQUEST_ERROR_MESSAGE,
  FORBIDDEN_ERROR_MESSAGE,
  NOT_FOUND_ERROR_MESSAGE,
  DELETE_MOVIE_MESSAGE,
} = require('../utils/res-consts');

const BadRequestError = require('../middlewares/errors/bad-request-error');
const ForbiddenError = require('../middlewares/errors/forbidden-error');
const NotFoundError = require('../middlewares/errors/not-found-error');

module.exports.getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.status(OK_STATUS).send(movies))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  Movie.create({
    ...req.body,
    owner: req.user._id,
  })
    .then((movie) => res.status(CREATED_STATUS).send(movie))
    .catch(next);
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params._id)
    .orFail(() => {
      throw new NotFoundError(NOT_FOUND_ERROR_MESSAGE);
    })
    .then((movie) => {
      if (req.user._id !== movie.owner._id.toString()) {
        throw new ForbiddenError(FORBIDDEN_ERROR_MESSAGE);
      } else {
        return movie.remove();
      }
    })
    .then(() => res.status(OK_STATUS).send({ message: DELETE_MOVIE_MESSAGE }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(BAD_REQUEST_ERROR_MESSAGE));
      } else {
        next(err);
      }
    });
};
