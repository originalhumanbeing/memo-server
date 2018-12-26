const app = require('../app');
const request = require('supertest');
const models = require('../models/index');


// Arange Act Assert
describe('Auth Signup Test', () => {
    const nickname = 'pillow';
    const email = 'pillow@email.com';
    const pwd = 'pillow';
    const checkpwd = 'pillow';
    const secondNickname = 'dawn';
    const secondEmail = 'dawn@email.com';
    const secondPwd = 'dawn1';

    beforeEach(async () => {
        await models.Member.create({nickname: secondNickname, email: secondEmail, pwd: secondPwd});
    });

    afterEach(async () => {
        await models.Member.destroy({where: {email}});
        await models.Member.destroy({where: {email: secondEmail}});
    });

    test('회원가입 데이터가 없을 때, 400', async () => {
        //arrange

        //act
        const res = await request(app).post('/signup');

        //assert
        expect(res.statusCode).toBe(400);
        expect(res.body["body"]).toBe("모든 항목을 입력해주셔야 가입이 가능합니다");
    });

    test('회원가입시 비밀번호에 숫자가 없을 때, 400', async () => {
        //arrange

        //act
        const res = await request(app).post('/signup').send({nickname, email, pwd, checkpwd});

        //assert
        expect(res.statusCode).toBe(400);
        expect(res.body["body"]).toBe("숫자와 영소문자를 조합한 최소 4자리 이상의 비밀번호를 입력하세요");
    });

    test('회원가입시 비밀번호가 4글자 이하일 때, 400', async () => {
        //arrange
        const pwd = 'a';
        const checkpwd = 'a';

        //act
        const res = await request(app).post('/signup').send({nickname, email, pwd, checkpwd});

        //assert
        expect(res.statusCode).toBe(400);
        expect(res.body["body"]).toBe("숫자와 영소문자를 조합한 최소 4자리 이상의 비밀번호를 입력하세요");
    });

    test('회원가입시 비밀번호가 확인 비밀번호와 다를 때, 400', async () => {
        //arrange
        const pwd = 'alive5';
        const checkpwd = 'alive7';

        //act
        const res = await request(app).post('/signup').send({nickname, email, pwd, checkpwd});

        //assert
        expect(res.statusCode).toBe(400);
        expect(res.body["body"]).toBe("비밀번호가 일치하지 않습니다");
    });

    test('이미 가입되어 있는 아이디로 회원가입을 시도했을 때, 400', async () => {
        //arrange
        const pwd = 'pillow1';
        const checkpwd = 'pillow1';

        //act
        await request(app).post('/signup').send({nickname, email, pwd, checkpwd});
        const res = await request(app).post('/signup').send({nickname, email, pwd, checkpwd});

        //assert
        expect(res.statusCode).toBe(400);
        expect(res.body["body"]).toBe("이메일이 이미 존재합니다");
    });

    test('적합한 데이터로 회원가입 했을 때, 201', async () => {
        //arrange
        const pwd = 'pillow1';
        const checkpwd = 'pillow1';

        //act
        const res = await request(app).post('/signup').send({nickname, email, pwd, checkpwd});

        //assert
        expect(res.statusCode).toBe(201);
    });

    test('이메일 형식이 적합하지 않을 때, 400', async () => {
        //arrange
        const email = 'email';

        //act
        const res = await request(app).post('/signup').send({nickname, email, pwd, checkpwd});

        //assert
        expect(res.statusCode).toBe(400);
    });

    test('이미 가입되어 있는 닉네임으로 회원가입을 시도했을 때, 400', async () => {
        //arrange
        const secondNickname = 'dawn';
        const secondEmail = 'dawnwoo@email.com';
        const secondPwd = 'dawn1';
        const secondCheckPwd = 'dawn1';

        //act
        const res = await request(app).post('/signup').send({
            nickname: secondNickname,
            email: secondEmail,
            pwd: secondPwd,
            checkpwd: secondCheckPwd
        });

        //assert
        expect(res.statusCode).toBe(400);
        expect(res.body["body"]).toBe("닉네임이 이미 존재합니다");
    });
});
