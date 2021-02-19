const dotenv = require('dotenv').config();
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');
const PROJECT_NAME = 'Keystone Blog';
const adapterConfig = {
  mongoUri: process.env.MONGO_URI,
};

// @desc authenticate user
const isLoggedIn = ({ authentication: { item: user } }) => {
  return !!user;
};

// @desc authenticate user type
const isAdmin = ({ authentication: { item: user } }) => {
  return !!user && !!user.isAdmin;
};

// Mongoose schemas
const PostSchema = require('./lists/Post');
const UserSchema = require('./lists/User');

// init keystone with adapter
const keystone = new Keystone({
  adapter: new Adapter(adapterConfig),
  cookieSecret: process.env.COOKIE_SECRET,
});

// Posts API access control
keystone.createList('Post', {
  fields: PostSchema.fields,
  access: {
    read: true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
});

// Users API access control
keystone.createList('User', {
  fields: UserSchema.fields,
  access: {
    read: true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
});

// Restricting admin area
const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  config: {
    identityField: 'email',
    secretField: 'password',
  },
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      name: PROJECT_NAME,
      enableDefaultRoute: true,
      authStrategy,
      isAccessAllowed: isAdmin,
    }),
  ],
};
