const app = require('../app');
const request = require('supertest');

describe('Auth Test', () => {
    test('version', async () => {
        const response = await request(app).get('/version');
        expect(response.statusCode).toBe(200);
        expect(response.body.version).toBe("1.0.0")
    });
});