const jwt = require('jsonwebtoken'),
    crypto = require('crypto');

const JWT_SECRET_CODE = 'secretCode',
    PWD_SALT = 'let there be salt';


// jwt 토큰 Promise로 생성
function createToken(nickname) {
    return new Promise((resolve, reject) => {
        jwt.sign({
            nickname: nickname
        }, JWT_SECRET_CODE, {
                expiresIn: '7d'
            }, (err, token) => {
                if (err) reject(err);
                resolve(token);
            });
    });
}

// verify, decode한 jwt token Promise로 반환
function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token, JWT_SECRET_CODE, (err, decodedToken) => {
                if (err || decodedToken == 'undefined') reject(err);
                resolve(decodedToken);
            });
    });
}

function pbkdf2Async(pwd, salt) {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(pwd, salt.toString('base64'), 130492, 64, 'sha512', function (err, pwd) {
            if (err) return reject(err);
            resolve(pwd.toString('base64'));
        });
    });
}


module.exports = {
    SALT: PWD_SALT,
    createToken,
    verifyToken,
    pbkdf2Async
};