let currentUser = '';
let currentFile = '';
let cursorStart = '';
let cursorEnd = '';

class List {
    constructor() {
        this.list = document.querySelector('.list');
        this.showList();
    }

    showList() {
        fetch(`http://localhost:8080/memos/${currentUser}`, {
            method: 'get'
        }).then((res) => res.json()).then((data) => {
            if (!data['body'] || data['body'].length === 0) return;

            this.list.innerHTML = '';
            data['body'].sort((a, b) => a - b);
            for (let memo of data['body']) {
                let li = document.createElement('li');
                li.classList.add(memo);
                li.innerText = memo;
                li.addEventListener('click', (e) => {
                    new TextArea(e);
                });
                this.list.appendChild(li);
            }
        })
    }
}

class TextArea {
    constructor(e) {
        this.textarea = document.querySelector('.memo');
        this.findCursor();
        this.showMemo(e);
    }

    findCursor() {
        this.textarea.addEventListener('keypress', () => {
            cursorStart = this.textarea.selectionStart;
            cursorEnd = this.textarea.selectionEnd;
        })
    }

    showMemo(e) {
        currentFile = e.target.className;
        fetch(`http://localhost:8080/memo/${currentUser}/${currentFile}`, {
            method: 'get'
        }).then((res) => res.json()).then((data) => {
            this.textarea.value = data.body.content;
            this.textarea.setSelectionRange(data.body.cursorStart, data.body.cursorEnd);
            this.textarea.focus();
        })
    }
}

class Menu {
    constructor() {
        this.textarea = document.querySelector('.memo');
        this.writeBtn = document.querySelector('.writeBtn');
        this.saveBtn = document.querySelector('.saveBtn');
        this.updateBtn = document.querySelector('.updateBtn');
        this.deleteBtn = document.querySelector('.deleteBtn');

        this.writeBtn.addEventListener('click', () => {
            this.textarea.value = '';
        });

        this.saveBtn.addEventListener('click', () => {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            cursorStart = this.textarea.selectionStart;
            cursorEnd = this.textarea.selectionEnd;

            fetch(`http://localhost:8080/memo/${currentUser}`, {
                method: 'post',
                headers: myHeaders,
                body: JSON.stringify({
                    memo: this.textarea.value,
                    user: currentUser,
                    cursorStart: cursorStart,
                    cursorEnd: cursorEnd
                })
            }).then((res) => res.json()).then((data) => {
                this.textarea.value = data.body.content;
                cursorStart = data.body.cursorStart;
                cursorEnd = data.body.cursorEnd;
                currentFile = data.body.title;
                new List();
            })
        });

        this.updateBtn.addEventListener('click', () => {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            cursorStart = this.textarea.selectionStart;
            cursorEnd = this.textarea.selectionEnd;

            fetch(`http://localhost:8080/memo/${currentUser}/${currentFile}`, {
                method: 'put',
                headers: myHeaders,
                body: JSON.stringify({
                    memo: this.textarea.value,
                    user: currentUser,
                    cursorStart: cursorStart,
                    cursorEnd: cursorEnd
                })
            }).then((res) => res.json()).then((data) => {
                this.textarea.value = data.body.content;
                cursorStart = data.body.cursorStart;
                cursorEnd = data.body.cursorEnd;
                currentFile = data.body.title;
                new List();
            })
        });

        this.deleteBtn.addEventListener('click', () => {
            fetch(`http://localhost:8080/memo/${currentUser}/${currentFile}`, {
                method: 'delete'
            }).then((res) => res.json()).then(data => {
                window.alert(data.body);
            }).then(() => {
                new List();
            });
            this.textarea.value = '';
        });
    }
}

class Notepad {
    constructor() {
        this.textarea = document.querySelector('.memo');
        this.list = document.querySelector('.list');

        this.authForm = document.querySelector('#auth');
        this.id = document.querySelector('#id');
        this.pwd = document.querySelector('#pwd');
        this.loginBtn = document.querySelector('#loginBtn');
        this.authFailMsg = document.querySelector('.authFailMsg');

        this.userNav = document.querySelector('#userNav');
        this.userNickname = document.querySelector('#userNickname');
        this.logoutBtn = document.querySelector('#logoutBtn');

        this.logIn();
        this.logOut();

        new Menu();
    }

    logIn() {
        this.loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let id = this.id.value;
            let pwd = this.pwd.value;
            this.validateUser(id, pwd);
        });
    }

    validateUser(id, pwd) {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        fetch(`http://localhost:8080/login`, {
            method: 'post',
            headers: myHeaders,
            body: JSON.stringify({id: id, pwd: pwd})
        }).then((res) => res.json()).then((data) => {
            if (!data['body'] || !data['body'].isLogin) {
                this.authFailMsg.innerText = data['body'];
                this.authFailMsg.hidden = false;
                return;
            }

            if (!data['lastwork']) {
                currentFile = '';
                this.textarea.value = '';
                this.textarea.autofocus = true;
            } else {
                currentFile = data['lastwork'].title;
                this.textarea.value = data['lastwork'].content;
                this.textarea.setSelectionRange(data['lastwork'].cursorStart, data['lastwork'].cursorEnd);
                this.textarea.focus();
            }
            currentUser = data['body'].nickname;
            new List();
            this.authForm.hidden = true;
            this.userNickname.innerText = currentUser + '님';
            this.userNav.hidden = false;
            this.authFailMsg.hidden = true;
        }).then(() => {
            this.id.value = '';
            this.pwd.value = '';
        })
    }

    logOut() {
        this.logoutBtn.addEventListener('click', () => {
            currentUser = '';
            currentFile = '';
            this.list.innerHTML = '';
            this.textarea.value = '';
            this.authForm.hidden = false;
            this.userNav.hidden = true;
        });
    }
}

