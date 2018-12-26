module.exports = {
    test: {
        "username": "root",
        "password": "bsoup0404@",
        "database": "knowrememo",
        "host": "127.0.0.1",
        "dialect": "mysql",
        "port": 13306,
        "pool": {
            "max": 5,
            "min": 0,
            "acquire": 30000,
            "idle": 10000
        },
        "logging": true
    },
    development: {
        "username": "root",
        "password": "bsoup0404@",
        "database": "knowrememo",
        "host": "127.0.0.1",
        "dialect": "mysql",
        "port": 13306,
        "pool": {
            "max": 5,
            "min": 0,
            "acquire": 30000,
            "idle": 10000
        },
        "logging": true
    },
    production: {
        "username": process.env.DB_USERNAME,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_DATABASE,
        "host": process.env.DB_HOST,
        "dialect": "mysql",
        "pool": {
            "max": 5,
            "min": 0,
            "acquire": 30000,
            "idle": 10000
        },
        "logging": true
    }
};