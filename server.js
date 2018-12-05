const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    MySQLStore = require('express-mysql-session')(session),
    models = require('./models'),
    crypto = require('crypto'),
    cors = require('cors'),
    app = express();

const sessionStoreOptions = {
    host: 'localhost',
    port: 13306,
    user: 'root',
    password: 'bsoup0404@',
    database: 'knowrememo'
};

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('client'));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore(sessionStoreOptions),
    cookie: {
        maxAge: 24000 * 60 * 60
    }
}));

models.sequelize.sync()
    .then(() => {
        console.log('✓ DB connection success.');
    })
    .catch(err => {
        console.error(err);
        console.log('✗ DB connection error. Please make sure DB is running.');
        process.exit();
    });

// models.Member.hasMany(models.Memo, {foreignKey: 'owner'});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let salt = 'let there be salt';
function pbkdf2Async(pwd, salt) {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(pwd, salt.toString('base64'), 130492, 64, 'sha512', function (err, pwd) {
            if (err) return reject(err);
            resolve(pwd.toString('base64'));
        });
    });
}

app.post('/signup', async function (req, res) {
    const { nickname, email, pwd, checkpwd } = req.body;

    if (!nickname || !email || !pwd || !checkpwd) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: '모든 항목을 작성해주셔야 가입이 가능합니다' }));
        return;
    }

    let queryResult = await models.Member.findOne({ where: { email } });
    if (queryResult != null) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: '아이디가 이미 존재합니다' }));
        return;
    }

    if (pwd !== checkpwd) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: '비밀번호가 일치하지 않습니다' }));
        return;
    }

    const encryptedPwd = await pbkdf2Async(pwd, salt);
    let newMember = await models.Member.create({ nickname, email, pwd: encryptedPwd });
    if (newMember == null) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: '회원가입을 다시 시도해주세요' }));
        return;
    }

    res.writeHead(201, { 'Content-Type': 'text/html' });
    res.end(JSON.stringify({ success: 'ok', body: '이제 Memo Memo를 사용해보세요!' }));
    return;
})

// login 하기
app.post('/login', async function (req, res) {
    let id = req.body.id;
    let pwd = req.body.pwd;

    if (!id || !pwd) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: '로그인이 필요합니다!' }));
        return;
    }

    let queryResult = await models.Member.findOne({ where: { email: id } });
    if (queryResult === null) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: '아이디가 존재하지 않습니다!' }));
        return;
    }

    const encryptedPwd = await pbkdf2Async(pwd, salt);
    if (encryptedPwd !== queryResult.dataValues.pwd) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: '비밀번호가 일치하지 않습니다!' }));
        return;
    }

    req.session.isLogin = true;
    req.session.nickname = queryResult.dataValues.nickname;

    console.log(req.session);
    
    let lastMemoTitle = queryResult.dataValues.lastwork;
    if (lastMemoTitle === null) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: req.session }));
        return;
    }

    id = id.split('@')[0];
    const lastMemo = await models.Memo.findOne({ where: { owner: id, title: lastMemoTitle } });
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(JSON.stringify({
        body: req.session,
        lastwork: lastMemo.dataValues
    }));
});

// 전체 메모 리스트 가져오기
app.get('/memos/:user', async function (req, res) {
    let user = req.params.user;
    let data = [];

    const results = await models.Memo.findAll({ where: { owner: user } });
    for (let result of results) {
        data.push(result.dataValues.title);
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(JSON.stringify({ body: data }));
});

// 메모 읽기
app.get('/memo/:user/:title', async function (req, res) {
    let user = req.params.user;
    let id = req.params.title;
    const updatedLastwork = await models.Member.update({
        lastwork: id
    }, {
            where: { nickname: user }
        });
    if (updatedLastwork != 1) {
        console.log(updatedLastwork);
    }

    let result = await models.Memo.findOne({ where: { owner: user, title: id } });
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
    let memo = req.body.memo;
    let user = req.body.user;
    let cursorStart = req.body.cursorStart;
    let cursorEnd = req.body.cursorEnd;

    if (!memo || !user) return res.sendStatus(404);

    // 파일명 만들기
    const results = await models.Memo.findAll({ where: { owner: user } });
    let fileTitles = [];
    for (let result of results) {
        fileTitles.push(result.dataValues.title);
    }
    fileTitles.sort((a, b) => a - b);
    const lastFileTitle = fileTitles[results.length - 1];
    const title = Number(lastFileTitle) + 1;

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
        lastwork: title
    }, {
            where: { nickname: user }
        });
    if (updatedLastwork != 1) {
        console.log(updatedLastwork);
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(JSON.stringify({ body: createdResult }));
});

// 메모 수정
app.put('/memo/:user/:title', async function (req, res) {
    const user = req.params.user;
    const title = req.params.title;
    const memo = req.body.memo;
    const cursorStart = req.body.cursorStart;
    const cursorEnd = req.body.cursorEnd;

    const updatedResult = await models.Memo.update({
        content: memo,
        cursorStart: cursorStart,
        cursorEnd: cursorEnd
    }, {
            where: { owner: user, title: title }
        });

    if (updatedResult != 1) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: '수정에 실패했습니다!' }));
        return;
    }

    const updatedLastwork = await models.Member.update({
        lastwork: title
    }, {
            where: { nickname: user }
        });
    if (updatedLastwork != 1) {
        console.log(updatedLastwork);
    }

    const result = await models.Memo.findOne({ where: { owner: user, title: title } });
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(JSON.stringify({ body: result.dataValues }));
});

// 메모 삭제
app.delete('/memo/:user/:title', async function (req, res) {
    let user = req.params.user;
    let title = req.params.title;

    const destroyedResult = await models.Memo.destroy({ where: { owner: user, title: title } });
    if (destroyedResult != 1) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(JSON.stringify({ body: `${title} 삭제에 실패했습니다` }));
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
    res.end(JSON.stringify({ body: `${title}이 삭제 완료되었습니다` }));
});

app.listen(8080, () => {
    console.log('Server started!');
});
