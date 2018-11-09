class Notepad {
    constructor() {
        this.writeBtn = document.querySelector('.writeBtn');
        this.saveBtn = document.querySelector('.saveBtn');
        this.updateBtn = document.querySelector('.updateBtn');
        this.deleteBtn = document.querySelector('.deleteBtn');

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

        this.currentUser = '';
        this.currentFile = '';
        this.cursorStart = '';
        this.cursorEnd = '';

        this.addClickEvents();
        this.findCursor();
        this.showMemo();
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

            if (data['lastMemoContent']) {
                this.currentFile = data['lastMemoContent'];
                this.textarea.setSelectionRange(data['lastMemoContent'].cursorStart, data['lastMemoContent'].cursorEnd);
                this.textarea.focus();
            }
            this.textarea.value = '';
            this.currentFile = '';
            this.currentUser = data['body'].nickname;
            this.showList();
            this.authForm.hidden = true;
            this.userNickname.innerText = this.currentUser + '님';
            this.userNav.hidden = false;
            this.authFailMsg.hidden = true;
        }).then(() => {
            this.id.value = '';
            this.pwd.value = '';
        })
    }

    findCursor() {
        this.textarea.addEventListener('keypress', () => {
            this.cursorStart = this.textarea.selectionStart;
            this.cursorEnd = this.textarea.selectionEnd;
        })
    }

    showList() {
        fetch(`http://localhost:8080/memos/${this.currentUser}`, {
            method: 'get'
        }).then((res) => res.json()).then((data) => {
            if (!data['body'] || data['body'].length === 0) return;

            this.list.innerHTML = '';
            data['body'].sort((a, b) => a - b);
            for (let memo of data['body']) {
                let li = document.createElement('li');
                li.classList.add(memo);
                li.innerText = memo;
                li.addEventListener('click', this.showMemo(this));
                this.list.appendChild(li);
            }
        })
    }

    showMemo(notepad) {
        return e => {
            notepad.currentFile = e.target.className;
            fetch(`http://localhost:8080/memo/${notepad.currentUser}/${notepad.currentFile}`, {
                method: 'get'
            }).then((res) => res.json()).then((data) => {
                notepad.textarea.value = data.body.content;
                notepad.textarea.setSelectionRange(data.body.cursorStart, data.body.cursorEnd);
                notepad.textarea.focus();
            })
        }
    }

    addClickEvents() {
        this.loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let id = this.id.value;
            let pwd = this.pwd.value;
            this.validateUser(id, pwd);
        });

        this.logoutBtn.addEventListener('click', () => {
            this.currentUser = '';
            this.currentFile = '';
            this.list.innerHTML = '';
            this.authForm.hidden = false;
            this.userNav.hidden = true;
        });

        this.writeBtn.addEventListener('click', () => {
            this.textarea.value = '';
        });

        this.saveBtn.addEventListener('click', () => {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            this.cursorStart = this.textarea.selectionStart;
            this.cursorEnd = this.textarea.selectionEnd;

            fetch(`http://localhost:8080/memo/${this.currentUser}`, {
                method: 'post',
                headers: myHeaders,
                body: JSON.stringify({
                    memo: this.textarea.value,
                    user: this.currentUser,
                    cursorStart: this.cursorStart,
                    cursorEnd: this.cursorEnd
                })
            }).then((res) => res.json()).then((data) => {
                this.textarea.value = data.body.content;
                this.cursorStart = data.body.cursorStart;
                this.cursorEnd = data.body.cursorEnd;
                this.currentFile = data.body.title;
                this.showList();
            })
        });

        this.updateBtn.addEventListener('click', () => {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            this.cursorStart = this.textarea.selectionStart;
            this.cursorEnd = this.textarea.selectionEnd;

            fetch(`http://localhost:8080/memo/${this.currentUser}/${this.currentFile}`, {
                method: 'put',
                headers: myHeaders,
                body: JSON.stringify({
                    memo: this.textarea.value,
                    user: this.currentUser,
                    cursorStart: this.cursorStart,
                    cursorEnd: this.cursorEnd
                })
            }).then((res) => res.json()).then((data) => {
                console.log('update된 데이터', data);
                this.textarea.value = data.body.content;
                this.cursorStart = data.body.cursorStart;
                this.cursorEnd = data.body.cursorEnd;
                this.currentFile = data.body.title;
                this.showList();
            })
        });

        this.deleteBtn.addEventListener('click', () => {
            fetch(`http://localhost:8080/memo/${this.currentUser}/${this.currentFile}`, {
                method: 'delete'
            }).then((res) => res.json()).then(data => {
                window.alert(data.body);
            }).then(res => {
                this.showList();
            });
            this.textarea.value = '';
        });
    }
}

