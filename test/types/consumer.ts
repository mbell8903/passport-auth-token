import AuthTokenStrategy = require('../..');
import DefaultStrategy from '../..';
import { Strategy as NamedStrategy } from '../..';

const directStrategy = new AuthTokenStrategy((token, done) => {
    done(null, { token });
});

const configuredStrategy = new AuthTokenStrategy(
    {
        headerFields: ['authorization'],
        tokenFields: ['token'],
        caseInsensitive: true
    },
    (token, done) => {
        done(null, { token });
    }
);

const requestStrategy = new AuthTokenStrategy(
    {
        headerFields: ['authorization'],
        passReqToCallback: true
    },
    (request, token, done) => {
        done(null, { path: request.path, token });
    }
);

const defaultStrategy = new DefaultStrategy((token, done) => {
    done(null, { token });
});

const importedNamedStrategy = new NamedStrategy((token, done) => {
    done(null, { token });
});

directStrategy.authenticate({} as never);
configuredStrategy.authenticate({} as never, {
    session: false,
    params: true,
    optional: true,
    caseInsensitive: false,
    badRequestMessage: 'Token required'
});
requestStrategy.authenticate({} as never);
defaultStrategy.authenticate({} as never);
importedNamedStrategy.authenticate({} as never);
