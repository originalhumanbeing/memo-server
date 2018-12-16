const models = require('../models'),
    Op = require('sequelize').Op,
    auth = require('../helpers/auth'),
    router = require('express').Router();


router.post('/signup', async function (req, res) {
    const { nickname, email, pwd, checkpwd } = req.body;

    if (!nickname || !email || !pwd || !checkpwd) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: '모든 항목을 작성해주셔야 가입이 가능합니다' }));
        return;
    }

    let queryResult = await models.Member.findOne({
        where: {[Op.or]: [{email: email}, {nickname: nickname}]}
    });

    if (queryResult != null && queryResult.dataValues.email === email) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: '아이디가 이미 존재합니다' }));
        return;
    }
    // TODO: email 형식 validation 하기

    if (queryResult != null && queryResult.dataValues.nickname === nickname) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: '닉네임이 이미 존재합니다' }));
        return;
    }

    if (pwd !== checkpwd) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: '비밀번호가 일치하지 않습니다' }));
        return;
    }
    // TODO: pwd 한영+최소 자릿수 validation 하기

    const encryptedPwd = await auth.pbkdf2Async(pwd, auth.SALT);
    let newMember = await models.Member.create({ nickname, email, pwd: encryptedPwd });
    if (newMember == null) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: '회원가입을 다시 시도해주세요' }));
        return;
    }

    res.writeHead(201, { 'Content-Type': 'text/html' });
    res.end(JSON.stringify({ success: 'ok', body: '이제 Memo Memo를 사용해보세요!' }));
});

// login 하기
router.post('/login', async function (req, res) {
    let id = req.body.id;
    let pwd = req.body.pwd;

    if (!id || !pwd) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ msg: '로그인이 필요합니다!' }));
        return;
    }

    let thisMember = await models.Member.findOne({ where: { email: id } });
    if (thisMember === null) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ msg: '아이디가 존재하지 않습니다!' }));
        return;
    }

    const encryptedPwd = await auth.pbkdf2Async(pwd, auth.SALT);
    if (encryptedPwd !== thisMember.dataValues.pwd) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ msg: '비밀번호가 일치하지 않습니다!' }));
        return;
    }

    const nickname = thisMember.dataValues.nickname;
    const token = await auth.createToken(nickname);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(JSON.stringify({
        token,
        nickname,
        msg: "로그인이 성공했습니다!"
    }));
});

module.exports = router;