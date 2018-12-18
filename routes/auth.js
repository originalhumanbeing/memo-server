const models = require('../models'),
    auth = require('../helpers/auth'),
    router = require('express').Router(),
    {UserException, UnexpectedException} = require('../helpers/exceptions'),
    {asyncErrorHandle} = require('../helpers/asyncHelper');


router.post('/signup', asyncErrorHandle(async (req, res) => {
    const {nickname, email, pwd, checkpwd} = req.body;

    assertItemsExist(nickname, email, pwd, checkpwd);
    await assertEmailIsNotDuplicated(email);
    // TODO: email 형식 validation 하기
    // assertEmailFormIsValid(email);
    await assertNicknameIsNotDuplicated(nickname);
    // TODO: pwd 한영+최소 자릿수 validation 하기
    // assertPasswordIsValid(pwd);
    assertPasswordIsMatched(pwd, checkpwd);
    await signup(pwd, nickname, email);

    res.status(201);
    res.json({success: 'ok', body: '이제 Memo Memo를 사용해보세요!'});
}));

// login 하기
router.post('/login', asyncErrorHandle(async (req, res) => {
    const {id, pwd} = req.body;

    if (!id || !pwd) {
        res.status(200);
        res.json({msg: '로그인이 필요합니다!'});
        return;
    }

    let thisMember = await models.Member.findOne({where: {email: id}});
    if (thisMember === null) {
        res.status(200);
        res.json({msg: '아이디가 존재하지 않습니다!'});
        return;
    }

    const encryptedPwd = await auth.pbkdf2Async(pwd, auth.SALT);
    if (encryptedPwd !== thisMember.dataValues.pwd) {
        res.status(200);
        res.json({msg: '비밀번호가 일치하지 않습니다!'});
        return;
    }

    const nickname = thisMember.dataValues.nickname;
    const token = await auth.createToken(nickname);

    res.status(200);
    res.json({
        token,
        nickname,
        msg: "로그인이 성공했습니다!"
    });
}));

function assertItemsExist(nickname, email, pwd, checkpwd) {
    if (!nickname || !email || !pwd || !checkpwd) {
        throw new UserException(400, '모든 항목을 작성해주셔야 가입이 가능합니다');
    }
}

async function assertEmailIsNotDuplicated(email) {
    let queryResult = await models.Member.findOne({where: {email}});
    if (queryResult != null && queryResult.dataValues.email === email) {
        throw new UserException(400, '아이디가 이미 존재합니다');
    }
}

async function assertNicknameIsNotDuplicated(nickname) {
    let queryResult = await models.Member.findOne({where: {nickname}});
    if (queryResult != null && queryResult.dataValues.nickname === nickname) {
        throw new UserException(400, '닉네임이 이미 존재합니다');
    }
}

function assertPasswordIsMatched(pwd, checkpwd) {

    if (pwd !== checkpwd) {
        throw new UserException(400, '비밀번호가 일치하지 않습니다');
    }
}

async function signup(pwd, nickname, email) {
    const encryptedPwd = await auth.pbkdf2Async(pwd, auth.SALT);
    let newMember = await models.Member.create({nickname, email, pwd: encryptedPwd});
    if (newMember == null) {
        throw new UnexpectedException('회원가입을 다시 시도해주세요');
    }
}

module.exports = router;