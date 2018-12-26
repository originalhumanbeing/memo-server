const models = require('../models'),
    auth = require('../helpers/auth'),
    router = require('express').Router(),
    {UserException, UnexpectedException} = require('../helpers/exceptions'),
    {asyncErrorHandle} = require('../helpers/asyncHelper');


router.post('/signup', asyncErrorHandle(async (req, res) => {
    const {nickname, email, pwd, checkpwd} = req.body;

    assertSignupItemsExist(nickname, email, pwd, checkpwd);
    await assertEmailIsNotDuplicated(email);
    assertEmailFormIsValid(email);
    await assertNicknameIsNotDuplicated(nickname);
    assertPasswordIsValid(pwd);
    assertPasswordIsMatched(pwd, checkpwd);
    await signup(pwd, nickname, email);

    res.status(201);
    res.json({success: 'ok', msg: '이제 Memo Memo를 사용해보세요!'});
}));

// login 하기
router.post('/login', asyncErrorHandle(async (req, res) => {
    const {id, pwd} = req.body;
    let thisMember = await models.Member.findOne({where: {email: id}});

    assertLoginItemsExist(id, pwd);
    await assertIdExist(id, thisMember);
    await assertPasswordIsCorrect(pwd, thisMember);

    const nickname = thisMember.dataValues.nickname;
    const token = await auth.createToken(nickname);

    res.status(200);
    res.json({token, nickname});
}));


function assertSignupItemsExist(nickname, email, pwd, checkpwd) {
    if (!nickname || !email || !pwd || !checkpwd) {
        throw new UserException(400, '모든 항목을 입력해주셔야 가입이 가능합니다');
    }
}

function assertEmailFormIsValid(email) {
    const validationExpression = /\S+@\S+/;
    const emailValidation = validationExpression.test(String(email).toLowerCase());
    if (!emailValidation) throw new UserException(400, '이메일 형식이 잘못되었습니다');
}

async function assertEmailIsNotDuplicated(email) {
    let queryResult = await models.Member.findOne({where: {email}});
    if (queryResult != null && queryResult.dataValues.email === email) {
        throw new UserException(400, '이메일이 이미 존재합니다');
    }
}

async function assertNicknameIsNotDuplicated(nickname) {
    let queryResult = await models.Member.findOne({where: {nickname}});
    if (queryResult != null && queryResult.dataValues.nickname === nickname) {
        throw new UserException(400, '닉네임이 이미 존재합니다');
    }
}

function assertPasswordIsValid(pwd) {
    const pwdExpression = /(?=.*\d)(?=.*[a-z]).{4,}/;
    const pwdValidation = pwdExpression.test(pwd);
    if (!pwdValidation || pwd.length < 4) throw new UserException(400, '숫자와 영소문자를 조합한 최소 4자리 이상의 비밀번호를 입력하세요');
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

function assertLoginItemsExist(id, pwd) {
    if (!id || !pwd) throw new UserException(400, '모든 항목을 입력해주셔야 로그인이 가능합니다');
}

async function assertIdExist(id, thisMember) {
    if (thisMember === null) throw new UserException(400, '아이디가 존재하지 않습니다');
}

async function assertPasswordIsCorrect(pwd, thisMember) {
    const encryptedPwd = await auth.pbkdf2Async(pwd, auth.SALT);
    if (encryptedPwd !== thisMember.dataValues.pwd) throw new UserException(400, '비밀번호가 일치하지 않습니다');
}

module.exports = router;