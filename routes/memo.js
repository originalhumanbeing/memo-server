const models = require('../models/index'),
    auth = require('../helpers/auth'),
    router = require('express').Router(),
    {asyncErrorHandle} = require('../helpers/asyncHelper'),
    {UserException, UnexpectedException} = require('../helpers/exceptions');

const momentTz = require('moment-timezone');

router.get('/initmemo/:nickname', asyncErrorHandle(async (req, res) =>{
    // 인증
    const nickname = req.params.nickname;
    try {
        await decodeToken(req, nickname);
    } catch (e) {
        return res.sendStatus(400);
    }

    // 메모 본문
    let thisMember = await models.Member.findOne({ where: { nickname: nickname } });
    let lastMemoId = thisMember.dataValues.lastwork;
    const lastWork = await models.Memo.findOne({ where: { owner: nickname, id: lastMemoId } });

    res.status(200);
    res.json({ lastWork });
}));

// 전체 메모 리스트 가져오기
router.get('/memos/:nickname', asyncErrorHandle(async (req, res) => {
    let memos = [];
    const nickname = req.params.nickname;
    try {
        await decodeToken(req, nickname);
    } catch (e) {
        return res.sendStatus(400);
    }

    const results = await models.Memo.findAll({ where: { owner: nickname } });
    for (let result of results) {
        let updatedAt = momentTz(result.dataValues.updatedAt, "Asia/Seoul").format("YYYY/MM/DD HH:mm:ss");
        memos.push({
            id: result.dataValues.id,
            title: result.dataValues.title,
            updatedAt: updatedAt });
    }
    res.status(200);
    res.json({ body: memos });
}));

// 메모 읽기
router.get('/memo/:nickname/:currentFile', asyncErrorHandle(async (req, res) => {
    const nickname = req.params.nickname;
    try {
        await decodeToken(req, nickname);
    } catch (e) {
        console.log(e);
        return res.sendStatus(400);
    }

    let memoId = req.params.currentFile;
    const updatedLastwork = await models.Member.update({
        lastwork: memoId
    }, {
            where: { nickname }
        });

    if (updatedLastwork != 1) {
        console.log(updatedLastwork);
    }

    let result = await models.Memo.findOne({ where: { owner: nickname, id: memoId } });
    if (result === null) {
        res.status(200);
        res.json({ body: '해당 메모가 존재하지 않습니다!' });
        return;
    }
    res.status(200);
    res.json({ body: result.dataValues });
}));

// 새 메모 저장
router.post('/memo/:nickname', asyncErrorHandle(async (req, res) => {
    const nickname = req.params.nickname;
    try {
        await decodeToken(req, nickname);
    } catch (e) {
        console.log(e);
        return res.sendStatus(400);
    }

    let memoId = req.body.memoId;
    let memo = req.body.memo;
    let cursorStart = req.body.cursorStart;
    let cursorEnd = req.body.cursorEnd;

    if (!memo || !nickname) return res.sendStatus(404);

    let title = String(memo).substring(0, 20);
    if (title.length >= 20) {
        title += '...';
    }

    if (memoId) {
        const updatedResult = await models.Memo.update({
            title: title,
            content: memo,
            cursorStart: cursorStart,
            cursorEnd: cursorEnd
        }, {
            where: { id: memoId, owner: nickname }
        });

        const updatedLastwork = await models.Member.update({
            lastwork: memoId
        }, {
            where: { nickname }
        });

        if (updatedLastwork != 1) {
            console.log(updatedLastwork);
            // TODO: 마지막 작업 업데이트에 실패했으면 다시 시도하도록?
        }

        const updatedMemo = await models.Memo.findOne({ where: { id: memoId } });
        res.status(200);
        res.json({ body: updatedMemo.dataValues });
        return;
    }

    let createdResult;
    try {
        createdResult = await models.Memo.create({
            owner: nickname,
            title: title,
            content: memo,
            cursorStart: cursorStart,
            cursorEnd: cursorEnd,
        });
    } catch (e) {
        res.status(200);
        res.json({ body: '저장에 실패했습니다!' });
        return;
    }

    const updatedLastwork = await models.Member.update({
        lastwork: createdResult.dataValues.id
    }, {
            where: { nickname }
        });

    if (updatedLastwork != 1) {
        console.log(updatedLastwork);
        // TODO: 마지막 작업 업데이트에 실패했으면 다시 시도하도록?
    }

    res.status(200);
    res.json({ body: createdResult.dataValues });
}));

// 메모 삭제
router.delete('/memo/:nickname/:currentFile', asyncErrorHandle(async (req, res) => {
    const nickname = req.params.nickname;
    try {
        await decodeToken(req, nickname);
    } catch (e) {
        console.log(e);
        return res.sendStatus(400);
    }

    let memoId = req.params.currentFile;
    const destroyedResult = await models.Memo.destroy({ where: { owner: nickname, id: memoId } });
    if (destroyedResult != 1) {
        res.status(200);
        res.json({ body: `삭제에 실패했습니다` });
        return;
    }

    const updatedLastwork = await models.Member.update({
        lastwork: null
    }, {
            where: { nickname }
        });

    if (updatedLastwork != 1) {
        console.log(updatedLastwork);
    }
    res.status(200);
    res.json({ body: `삭제가 완료되었습니다` });
}));

async function decodeToken(req, nickname) {
    let token = req.headers['authorization'];
    let decodedToken = await auth.verifyToken(token);
    if (decodedToken.nickname !== nickname) throw new UserException(400, '다시 로그인 해 주세요');
}

module.exports = router;
