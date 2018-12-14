const path = require('path'),
    models = require('./models'),
    Op = require('sequelize').Op,
    auth = require('./auth'),
    app = require('./app');

const momentTz = require('moment-timezone');

// models.Member.hasMany(models.Memo, { foreignKey: 'owner', sourceKey: 'nickname' });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/signup', async function (req, res) {
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
app.post('/login', async function (req, res) {
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

app.get('/initmemo/:nickname', async function (req, res) {
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
app.get('/memos/:nickname', async function (req, res) {
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
app.get('/memo/:user/:currentFile', async function (req, res) {
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
app.post('/memo/:user', async function (req, res) {
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
app.delete('/memo/:user/:currentFile', async function (req, res) {
    let token = req.headers['authorization'];
    let user = req.params.user;
    let memoId = req.params.currentFile;

    let decodedToken = await auth.verifyToken(token);
    if (decodedToken.nickname !== user) return res.sendStatus(404);

    const destroyedResult = await models.Memo.destroy({ where: { owner: user, id: memoId } });
    if (destroyedResult != 1) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: `${memoId} 삭제에 실패했습니다` }));
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
    res.end(JSON.stringify({ body: `${memoId} 삭제가 완료되었습니다` }));
});

app.listen(8080, () => {
    console.log('Server started!');
});
