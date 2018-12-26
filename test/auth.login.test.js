const app = require('../app');
const request = require('supertest');
const models = require('../models/index');


// Arange Act Assert
describe('Auth Login Test', () => {
    const nickname = 'sunshine';
    const id = 'sunshine@email.com';
    const pwd = 'sunshine1';
    const encPwd = '5cZr4q5OMINOxXXhYQLk1h+VpRUIAFKgRC+58ruvlp9FVL7pmF0NRfTjK2u3AggsXxBHJnCORG9LKNGRbKX44g==';

    beforeEach(async () => {
        await models.Member.create({nickname, email:id, pwd: encPwd});
    });

    afterEach(async () => {
        await models.Member.destroy({where: {email:id}});
    });

    test('로그인 데이터가 없을 때, 400', async () => {
        //arrange

        //act
        const res = await request(app).post('/login');

        //assert
        expect(res.statusCode).toBe(400);
        expect(res.body["body"]).toBe("모든 항목을 입력해주셔야 로그인이 가능합니다");
    });

    test('로그인시 없는 아이디를 입력했을 때, 400', async () => {
        //arrange
        const wrongId = 'issue@email.com';

        //act
        const res = await request(app).post('/login').send({id: wrongId, pwd});

        //assert
        expect(res.statusCode).toBe(400);
        expect(res.body["body"]).toBe("아이디가 존재하지 않습니다");
    });

    test('로그인시 잘못된 비밀번호를 입력했을 때, 400', async () => {
        //arrange
        const wrongPwd = 'wrong';

        //act
        const res = await request(app).post('/login').send({id, pwd: wrongPwd});

        //assert
        expect(res.statusCode).toBe(400);
        expect(res.body["body"]).toBe("비밀번호가 일치하지 않습니다");
    });

    test('로그인 성공시, 200', async () => {
        //arrange

        //act
        const res = await request(app).post('/login').send({id, pwd});

        //assert
        console.log(res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body["token"]).not.toBeNull();
        expect(res.body["nickname"]).toEqual(nickname);
    });
});
