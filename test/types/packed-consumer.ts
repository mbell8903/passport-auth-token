import AuthTokenStrategy = require('passport-auth-token');
import DefaultStrategy from 'passport-auth-token';
import { Strategy as NamedStrategy } from 'passport-auth-token';

const directStrategy = new AuthTokenStrategy((token, done) => {
    done(null, { token });
});

const requestStrategy = new AuthTokenStrategy(
    { passReqToCallback: true },
    (request, token, done) => {
        done(null, { path: request.path, token });
    }
);

const defaultStrategy = new DefaultStrategy((token, done) => {
    done(null, { token });
});

const namedStrategy = new NamedStrategy((token, done) => {
    done(null, { token });
});

directStrategy.authenticate({} as never);
requestStrategy.authenticate({} as never, { session: false });
defaultStrategy.authenticate({} as never);
namedStrategy.authenticate({} as never);
