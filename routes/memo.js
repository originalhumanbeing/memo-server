const models = require('../models/index'),
    auth = require('../helpers/auth'),
    router = require('express').Router();

const momentTz = require('moment-timezone');

router.get('/initmemo/:nickname', async function (req, res) {
    // 인증
    const nickname = req.params.nickname;
    try {
        let token = req.headers['authorization'];
        let decodedToken = await auth.verifyToken(token);
        if (decodedToken.nickname !== nickname) return res.sendStatus(400);
    } catch (e) {
        return res.sendStatus(400);
    }

    // 메모 본문
    let thisMember = await models.Member.findOne({ where: { nickname: nickname } });
    let lastMemoId = thisMember.dataValues.lastwork;
    const lastWork = await models.Memo.findOne({ where: { owner: nickname, id: lastMemoId } });

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(JSON.stringify({ lastWork }));
});

// 전체 메모 리스트 가져오기
router.get('/memos/:nickname', async function (req, res) {
    let token = req.headers['authorization'];
    let nickname = req.params.nickname;
    let memos = [];

    let decodedToken = await auth.verifyToken(token);
    if (decodedToken.nickname !== nickname) return res.sendStatus(404);

    const results = await models.Memo.findAll({ where: { owner: nickname } });
    for (let result of results) {
        let updatedAt = momentTz(result.dataValues.updatedAt, "Asia/Seoul").format("YYYY/MM/DD HH:mm:ss");
        memos.push({
            id: result.dataValues.id,
            title: result.dataValues.title,
            updatedAt: updatedAt });
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(JSON.stringify({ body: memos }));
});

// 메모 읽기
router.get('/memo/:user/:currentFile', async function (req, res) {
    let token = req.headers['authorization'];
    let user = req.params.user;
    let memoId = req.params.currentFile;

    let decodedToken = await auth.verifyToken(token);
    console.log('@@@@@@ 메모 개별 읽기 : 토큰 검사 @@@@@@', decodedToken.nickname === user);
    if (decodedToken.nickname !== user) return res.sendStatus(404);

    const updatedLastwork = await models.Member.update({
        lastwork: memoId
    }, {
            where: { nickname: user }
        });
    if (updatedLastwork != 1) {
        console.log(updatedLastwork);
    }

    let result = await models.Memo.findOne({ where: { owner: user, id: memoId } });
    if (result === null) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: '해당 메모가 존재하지 않습니다!' }));
        return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(JSON.stringify({ body: result.dataValues }));
});

// 새 메모 저장
router.post('/memo/:user', async function (req, res) {
    let token = req.headers['authorization'];
    let memoId = req.body.memoId;
    let memo = req.body.memo;
    let user = req.body.user;
    let cursorStart = req.body.cursorStart;
    let cursorEnd = req.body.cursorEnd;

    let decodedToken = await auth.verifyToken(token);
    if (decodedToken.nickname !== user) return res.sendStatus(404);

    if (!memo || !user) return res.sendStatus(404);

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
            where: { id: memoId, owner: user }
        });

        const updatedLastwork = await models.Member.update({
            lastwork: memoId
        }, {
            where: { nickname: user }
        });

        if (updatedLastwork != 1) {
            console.log(updatedLastwork);
            // TODO: 마지막 작업 업데이트에 실패했으면 다시 시도하도록?
        }

        const updatedMemo = await models.Memo.findOne({ where: { id: memoId } });
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: updatedMemo.dataValues }));
        return;
    }

    let createdResult;
    try {
        createdResult = await models.Memo.create({
            owner: user,
            title: title,
            content: memo,
            cursorStart: cursorStart,
            cursorEnd: cursorEnd,
        });
    } catch (e) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: '저장에 실패했습니다!' }));
        return;
    }

    const updatedLastwork = await models.Member.update({
        lastwork: createdResult.dataValues.id
    }, {
            where: { nickname: user }
        });

    if (updatedLastwork != 1) {
        console.log(updatedLastwork);
        // TODO: 마지막 작업 업데이트에 실패했으면 다시 시도하도록?
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(JSON.stringify({ body: createdResult.dataValues }));
});

// 메모 삭제
router.delete('/memo/:user/:currentFile', async function (req, res) {
    let token = req.headers['authorization'];
    let user = req.params.user;
    let memoId = req.params.currentFile;

    let decodedToken = await auth.verifyToken(token);
    if (decodedToken.nickname !== user) return res.sendStatus(404);

    const destroyedResult = await models.Memo.destroy({ where: { owner: user, id: memoId } });
    if (destroyedResult != 1) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: `삭제에 실패했습니다` }));
        return;
    }

    const updatedLastwork = await models.Member.update({
        lastwork: null
    }, {
            where: { nickname: user }
        });
    if (updatedLastwork != 1) {
        console.log(updatedLastwork);
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(JSON.stringify({ body: `삭제가 완료되었습니다` }));
});

module.exports = router;
