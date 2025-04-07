const express = require('express');

const apiRoute = express.Router();

const listRoutesApi = [
  {
    path: '/user',
    route: require('./user.route'),
  },
  {
    path: '/auth',
    route: require('./auth.route'),
  },
  {
    path: '/product',
    route: require('./product.route'),
  },
  {
    path: '/category',
    route: require('./category.route'),
  },
  {
    path: '/manufacturer',
    route: require('./manufacturer.route'),
  },
  {
    path: '/address',
    route: require('./address.route'),
  },
  {
    path: '/cart',
    route: require('./cart.route'),
  },
  {
    path: '/favorite',
    route: require('./favorite.route'),
  },
  {
    path: '/comment',
    route: require('./comment.route'),
  },
  {
    path: '/order',
    route: require('./order.route'),
  },
  {
    path: '/payment',
    route: require('./payment.route'),
  },
  {
    path: '/statistic',
    route: require('./statistic.route'),
  },
];

listRoutesApi.forEach((route) => {
  apiRoute.use(route.path, route.route);
});

module.exports = apiRoute;
