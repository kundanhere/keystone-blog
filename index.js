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

const PostSchema = require('./lists/Post');
const UserSchema = require('./lists/User');

const keystone = new Keystone({
  adapter: new Adapter(adapterConfig),
  cookieSecret: process.env.COOKIE_SECRET,
});

keystone.createList('Post', PostSchema);
keystone.createList('User', UserSchema);

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
    }),
  ],
};
