class UserException extends Error {
    constructor(status, message) {
        super();

        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;

        this.message = message || 'Something went wrong. Please try again.';

        this.status = status || 400;
    }
}

class UnexpectedException extends Error {
    constructor(message) {
        super();

        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;

        this.message = message || 'Something went wrong. Please try again.';

        this.status = 500;
    }
}


module.exports = {
    UserException,
    UnexpectedException
};