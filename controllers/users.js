const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const {
  SALT_ROUND,
  SECRET_KEY,
} = require('../config/config');

const {
  OK_STATUS,
  CREATED_STATUS,
  BAD_REQUEST_ERROR_MESSAGE,
  NOT_FOUND_ERROR_MESSAGE,
  CONFLICT_ERROR_MESSAGE,
  LOGOUT_MESSAGE,
} = require('../utils/res-consts');

const BadRequestError = require('../middlewares/errors/bad-request-error');
const NotFoundError = require('../middlewares/errors/not-found-error');
const ConflictError = require('../middlewares/errors/conflict-error');

module.exports.createUser = (req, res, next) => {
  const {
    email,
    password,
    name,
  } = req.body;

  bcrypt.hash(password, SALT_ROUND)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then(() => {
      res.status(CREATED_STATUS).send({
        name,
        email,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError(CONFLICT_ERROR_MESSAGE));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  const { NODE_ENV, JWT_SECRET } = process.env;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : SECRET_KEY,
        { expiresIn: '7d' },
      );

      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: false,
      });

      res.status(OK_STATUS).send({ token });
    })
    .catch(next);
};

module.exports.logout = (req, res) => {
  res.clearCookie('jwt').send({ message: LOGOUT_MESSAGE });
};

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new NotFoundError(NOT_FOUND_ERROR_MESSAGE);
    })
    .then((user) => res.status(OK_STATUS).send({ email: user.email, name: user.name }))
    .catch(next);
};

module.exports.updateUserInfo = (req, res, next) => {
  const { email, name } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { email, name },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  )
    .orFail(() => {
      throw new NotFoundError(NOT_FOUND_ERROR_MESSAGE);
    })
    .then((user) => res.status(OK_STATUS).send({ email: user.email, name: user.name }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(BAD_REQUEST_ERROR_MESSAGE));
      } else if (err.code === 11000) {
        next(new ConflictError(CONFLICT_ERROR_MESSAGE));
      } else {
        next(err);
      }
    });
};
