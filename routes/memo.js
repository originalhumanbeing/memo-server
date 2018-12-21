const models = require('../models/index'),
    auth = require('../helpers/auth'),
    router = require('express').Router(),
    momentTz = require('moment-timezone'),
    {asyncErrorHandle} = require('../helpers/asyncHelper'),
    {UserException} = require('../helpers/exceptions');


router.get('/initmemo/:nickname', asyncErrorHandle(async (req, res) => {
    const nickname = req.params.nickname;
    await verifyUserRequest(req, nickname);

    let thisMember = await models.Member.findOne({where: {nickname: nickname}});
    let lastMemoId = thisMember.dataValues.lastwork;
    const lastWork = await models.Memo.findOne({where: {owner: nickname, id: lastMemoId}});

    res.status(200);
    res.json({lastWork});
}));

// 전체 메모 리스트 가져오기
router.get('/memos/:nickname', asyncErrorHandle(async (req, res) => {
    const nickname = req.params.nickname;
    await verifyUserRequest(req, nickname);

    let memos = await findMemosByNickname(nickname);
    res.status(200);
    res.json({memos});
}));

// 메모 읽기
router.get('/memo/:nickname/:memoId', asyncErrorHandle(async (req, res) => {
    const nickname = req.params.nickname;
    await verifyUserRequest(req, nickname);

    let memoId = req.params.memoId;
    await updateLastwork(memoId, nickname);

    let result = await models.Memo.findOne({where: {owner: nickname, id: memoId}});
    if (result === null) {
        res.status(204);
        res.json({body: '해당 메모가 존재하지 않습니다!'});
        return;
    }

    res.status(200);
    res.json({body: result.dataValues});
}));

// 새 메모 저장
router.post('/memo/:nickname', asyncErrorHandle(async (req, res) => {
    const nickname = req.params.nickname;
    await verifyUserRequest(req, nickname);

    const {memoId, content, cursorStart, cursorEnd} = req.body;
    assertMemodatasExist({content, nickname, cursorStart, cursorEnd});

    const title = extractTitle(content);
    let memo;
    if (memoId) {
        memo = await updateMemo({title, content, cursorStart, cursorEnd, memoId});
    } else {
        memo = await createMemo({nickname, title, content, cursorStart, cursorEnd});
    }
    await updateLastwork(memo.dataValues.id, nickname);

    res.status(200);
    res.json({body: memo.dataValues});
}));

// 메모 삭제
router.delete('/memo/:nickname/:memoId', asyncErrorHandle(async (req, res) => {
    const nickname = req.params.nickname;
    await verifyUserRequest(req, nickname);

    let memoId = req.params.memoId;
    await models.Memo.destroy({where: {owner: nickname, id: memoId}});

    await updateLastwork(null, nickname);

    res.status(200);
    res.json({body: `삭제가 완료되었습니다`});
}));



async function verifyUserRequest(req, nickname) {
    let token = req.headers['authorization'];
    let decodedToken;
    try {
        decodedToken = await auth.verifyToken(token);
    } catch (e) {
        throw new UserException(400, '다시 로그인 해 주세요');
    }
    if (decodedToken.nickname !== nickname)
        throw new UserException(400, '다시 로그인 해 주세요');
}

async function updateLastwork(memoId, nickname) {
    await models.Member.update(
        {lastwork: memoId},
        {where: {nickname}}
    );
}

async function findMemosByNickname(nickname) {
    const results = await models.Memo.findAll({where: {owner: nickname}});
    return results.map(result => ({
        id: result.dataValues.id,
        title: result.dataValues.title,
        updatedAt: momentTz(result.dataValues.updatedAt, "Asia/Seoul").format("YYYY/MM/DD HH:mm:ss")
    }))
}

async function updateMemo({title, content, cursorStart, cursorEnd, memoId}) {
    await models.Memo.update({title, content, cursorStart, cursorEnd}, {where: {id: memoId}});
    return await models.Memo.findOne({where: {id: memoId}});
}

async function createMemo({nickname, title, content, cursorStart, cursorEnd}) {
    return await models.Memo.create({owner: nickname, title, content, cursorStart, cursorEnd});
}

function extractTitle(content) {
    let title = String(content).substring(0, 20);
    if (title.length >= 20) {
        title += '...';
    }
    return title;
}

function assertMemodatasExist({content, nickname, cursorStart, cursorEnd}) {
    if (!content || !nickname || !cursorStart || !cursorEnd) throw new UserException(400, "Illegal Arguments!");
}


module.exports = router;
