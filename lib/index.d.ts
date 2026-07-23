import type { Request } from 'express';
import passport = require('passport');

declare class AuthTokenStrategy implements passport.Strategy {
    readonly name: 'authtoken';
    constructor(verify: AuthTokenStrategy.VerifyCallback);
    constructor(
        options: AuthTokenStrategy.StrategyOptions,
        verify: AuthTokenStrategy.VerifyCallback
    );
    constructor(
        options: AuthTokenStrategy.StrategyOptionsWithRequest,
        verify: AuthTokenStrategy.VerifyCallbackWithRequest
    );
    authenticate(
        req: Request,
        options?: AuthTokenStrategy.AuthenticateOptions
    ): void;
}

declare namespace AuthTokenStrategy {
    const Strategy: typeof AuthTokenStrategy;

    interface VerifyCallback {
        (token: any, done: VerifiedCallback): void;
    }

    interface VerifyCallbackWithRequest {
        (req: Request, token: any, done: VerifiedCallback): void;
    }

    interface VerifiedCallback {
        (error: any, user?: any, info?: any): void;
    }

    interface StrategyOptions {
        tokenFields?: string[];
        headerFields?: string[];
        passReqToCallback?: false;
        caseInsensitive?: boolean;
    }

    interface StrategyOptionsWithRequest {
        tokenFields?: string[];
        headerFields?: string[];
        passReqToCallback: true;
        caseInsensitive?: boolean;
    }

    interface AuthenticateOptions extends passport.AuthenticateOptions {
        params?: boolean;
        optional?: boolean;
        caseInsensitive?: boolean;
        badRequestMessage?: string;
    }
}

export = AuthTokenStrategy;
