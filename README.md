# passport-auth-token

[![Build](https://github.com/mbell8903/passport-auth-token/actions/workflows/publish.yml/badge.svg)](https://github.com/mbell8903/passport-auth-token/actions/workflows/publish.yml)

[Passport](https://www.passportjs.org/) strategy for authenticating with a
token supplied in request headers, the request body, the query string, or
optionally route parameters.

## Install

```shell
npm install passport-auth-token
```

## Configure a strategy

The strategy requires a `verify` callback that receives the token and calls
`done` with an error, an authenticated user, and optional authentication
information.

```js
const passport = require('passport');
const AuthTokenStrategy = require('passport-auth-token').Strategy;

passport.use(new AuthTokenStrategy(
  {
    headerFields: ['authorization'],
    tokenFields: ['token']
  },
  function(token, done) {
    AccessToken.findOne({ id: token }, function(err, accessToken) {
      if (err) {
        return done(err);
      }

      if (!accessToken) {
        return done(null, false);
      }

      return done(null, accessToken.user);
    });
  }
));
```

Set `passReqToCallback` when the verification callback also needs the request:

```js
passport.use(new AuthTokenStrategy(
  {
    headerFields: ['authorization'],
    passReqToCallback: true
  },
  function(req, token, done) {
    verifyTokenForRequest(req, token, done);
  }
));
```

## Authenticate requests

Use `passport.authenticate()` with the `authtoken` strategy:

```js
app.get(
  '/protected',
  passport.authenticate('authtoken', { session: false }),
  function(req, res) {
    res.json(req.user);
  }
);
```

Request-specific lookup behavior is passed through Passport:

```js
passport.authenticate('authtoken', {
  session: false,
  optional: true,
  params: true
});
```

## Options

Strategy constructor options:

- `tokenFields`: body, query, and optional route-parameter field names.
  Defaults to `['token']`.
- `headerFields`: request-header field names. Defaults to `[]`.
- `passReqToCallback`: passes `req` before `token` to the verify callback.
  Defaults to `false`.
- `caseInsensitive`: enables case-insensitive field-name lookup. This is
  explicitly opt-in and defaults to `false`. Exact matches take precedence;
  ambiguous differently cased fields are rejected.

Request-specific Passport authentication options:

- `params`: also checks route parameters after headers, the body, and the query
  string.
- `optional`: allows verification to proceed without a token.
- `caseInsensitive`: overrides the strategy's case-insensitive setting for the
  current request.
- `badRequestMessage`: changes the message returned when a required token is
  missing.

Token lookup order is:

1. Headers, in configured `headerFields` order.
2. For each configured `tokenFields` entry: the body, the query string, and
   then route parameters when `params` is enabled.

The first token found is used.

## Tests

```shell
npm install
npm test
npm run typecheck
npm run typecheck:pack
npm run coverage
```

Continuous integration runs on Node.js 18, 20, 22, and 24. Node.js 24 also
enforces 100% line and function coverage, 90% branch coverage, and validates
the TypeScript declarations from both the repository and a packed consumer.

## Credits

- [Mike Bell](https://github.com/mbell8903)

## License

[MIT](LICENSE)

Copyright (c) 2014-present Mike Bell
