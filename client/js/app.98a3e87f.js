(function(e){function t(t){for(var o,i,a=t[0],c=t[1],u=t[2],m=0,d=[];m<a.length;m++)i=a[m],r[i]&&d.push(r[i][0]),r[i]=0;for(o in c)Object.prototype.hasOwnProperty.call(c,o)&&(e[o]=c[o]);l&&l(t);while(d.length)d.shift()();return s.push.apply(s,u||[]),n()}function n(){for(var e,t=0;t<s.length;t++){for(var n=s[t],o=!0,a=1;a<n.length;a++){var c=n[a];0!==r[c]&&(o=!1)}o&&(s.splice(t--,1),e=i(i.s=n[0]))}return e}var o={},r={app:0},s=[];function i(t){if(o[t])return o[t].exports;var n=o[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.m=e,i.c=o,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)i.d(n,o,function(t){return e[t]}.bind(null,o));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="/";var a=window["webpackJsonp"]=window["webpackJsonp"]||[],c=a.push.bind(a);a.push=t,a=a.slice();for(var u=0;u<a.length;u++)t(a[u]);var l=c;s.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("56d7")},"034f":function(e,t,n){"use strict";var o=n("64a9"),r=n.n(o);r.a},"0580":function(e,t,n){},"56d7":function(e,t,n){"use strict";n.r(t);n("cadf"),n("551c"),n("097d");var o=n("2b0e"),r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"app"}},[n("router-view")],1)},s=[],i=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"wrapper"},[e.user.connectionState.authFailMsgShow?n("div",{staticClass:"authFailMsg"},[e._v(e._s(e.user.connectionState.authFailMsg))]):e._e(),e.user.connectionState.beforeLogin?n("form",{attrs:{id:"auth",method:"post"}},[n("input",{directives:[{name:"model",rawName:"v-model",value:e.user.id,expression:"user.id"}],attrs:{type:"text",id:"id",name:"id",placeholder:"email@email.com"},domProps:{value:e.user.id},on:{input:function(t){t.target.composing||e.$set(e.user,"id",t.target.value)}}}),n("input",{directives:[{name:"model",rawName:"v-model",value:e.user.pwd,expression:"user.pwd"}],attrs:{type:"password",id:"pwd",name:"pwd",placeholder:"password"},domProps:{value:e.user.pwd},on:{input:function(t){t.target.composing||e.$set(e.user,"pwd",t.target.value)}}}),n("input",{attrs:{type:"submit",id:"loginBtn",value:"Log in"},on:{click:e.login}}),n("router-link",{attrs:{to:"/signup"}},[e._v("Sign Up")])],1):e._e(),e.user.connectionState.beforeLogin?e._e():n("div",{attrs:{id:"userNav"}},[e.user.connectionState.beforeLogin?e._e():n("p",{attrs:{id:"userNickname"}},[e._v(" "+e._s(e.user.nickname+" 님"))]),n("button",{attrs:{id:"logoutBtn"},on:{click:e.logout}},[e._v("Log out")])]),n("div",{staticClass:"notepad"},[n("ul",{staticClass:"menu"},[n("li",[n("button",{staticClass:"writeBtn",on:{click:e.createMemo}},[e._v("새 메모")])]),n("li",[n("button",{staticClass:"saveBtn",on:{click:e.saveMemo}},[e._v("저장")])]),n("li",[n("button",{staticClass:"updateBtn",on:{click:e.updateMemo}},[e._v("수정 완료")])]),n("li",[n("button",{staticClass:"deleteBtn",on:{click:e.deleteMemo}},[e._v("삭제")])])]),n("ul",{staticClass:"list"},e._l(e.list,function(t){return n("li",{class:{clicked:e.user.currentFile===t},on:{click:e.showMemo}},[e._v(e._s(t))])})),n("textarea",{directives:[{name:"model",rawName:"v-model",value:e.memo.content,expression:"memo.content"}],ref:"memo",staticClass:"memo",attrs:{name:"memo",id:"memo",cols:"30",rows:"10",placeholder:"새 메모를 작성하세요!"},domProps:{value:e.memo.content},on:{keypress:e.findCursor,input:function(t){t.target.composing||e.$set(e.memo,"content",t.target.value)}}})])])},a=[],c=(n("55dd"),n("ac4d"),n("8a81"),n("ac6a"),{name:"Notepad",props:{msg:String},data:function(){return{user:{connectionState:{beforeLogin:!0,authFailMsg:"",authFailMsgShow:!1},id:"",nickname:"",pwd:"",currentFile:""},memo:{content:"",cursorStart:0,cursorEnd:0},list:[]}},methods:{login:function(e){var t=this;e.preventDefault();var n=new Headers;n.append("Content-Type","application/json"),fetch("http://localhost:8080/login",{method:"post",headers:n,body:JSON.stringify({id:this.user.id,pwd:this.user.pwd})}).then(function(e){e.headers.forEach(console.log);var t=!0,n=!1,o=void 0;try{for(var r,s=e.headers.entries()[Symbol.iterator]();!(t=(r=s.next()).done);t=!0){var i=r.value;console.log(i)}}catch(a){n=!0,o=a}finally{try{t||null==s.return||s.return()}finally{if(n)throw o}}return e.json()}).then(function(e){if(console.log(e),!e["body"]||!e["body"].isLogin)return t.user.connectionState.authFailMsgShow=!0,void(t.user.connectionState.authFailMsg=e["body"]);e["lastwork"]?(t.user.currentFile=e["lastwork"].title,t.memo.content=e["lastwork"].content,t.memo.cursorStart=e["lastwork"].cursorStart,t.memo.cursorEnd=e["lastwork"].cursorEnd):(t.user.currentFile="",t.memo.content=""),t.$refs.memo.setSelectionRange(t.memo.cursorStart,t.memo.cursorEnd),t.$refs.memo.focus(),t.user.nickname=e["body"].nickname,t.showList(),t.user.connectionState.authFailMsgShow=!1,t.user.connectionState.beforeLogin=!1})},logout:function(){this.user.id="",this.user.pwd="",this.user.nickname="",this.user.connectionState.beforeLogin=!0,this.user.currentFile="",this.memo.content=""},showList:function(){var e=this;fetch("http://localhost:8080/memos/".concat(this.user.nickname),{method:"get"}).then(function(e){return e.json()}).then(function(t){t["body"]&&0!==t["body"].length&&(t["body"].sort(function(e,t){return e-t}),e.list=t["body"])})},showMemo:function(e){var t=this;this.user.currentFile=e.target.innerText,fetch("http://localhost:8080/memo/".concat(this.user.nickname,"/").concat(this.user.currentFile),{method:"get"}).then(function(e){return e.json()}).then(function(e){t.memo.content=e["body"].content,t.memo.cursorStart=e["body"].cursorStart,t.memo.cursorEnd=e["body"].cursorEnd,t.$refs.memo.setSelectionRange(t.memo.cursorStart,t.memo.cursor),t.$refs.memo.focus()})},createMemo:function(){this.memo.content="",this.memo.cursorStart="",this.memo.cursorEnd="",this.$refs.memo.focus()},findCursor:function(e){this.memo.cursorStart=e.target.selectionStart,this.memo.cursorEnd=e.target.selectionEnd},saveMemo:function(){var e=this,t=new Headers;t.append("Content-Type","application/json"),fetch("http://localhost:8080/memo/".concat(this.user.nickname),{method:"post",headers:t,body:JSON.stringify({memo:this.memo.content,user:this.user.nickname,cursorStart:this.memo.cursorStart,cursorEnd:this.memo.cursorEnd})}).then(function(e){return e.json()}).then(function(t){e.user.currentFile=t.body.title,e.memo.content=t.body.content,e.showList()})},updateMemo:function(){var e=this,t=new Headers;t.append("Content-Type","application/json"),fetch("http://localhost:8080/memo/".concat(this.user.nickname,"/").concat(this.user.currentFile),{method:"put",headers:t,body:JSON.stringify({memo:this.memo.content,user:this.user.nickname,cursorStart:this.memo.cursorStart,cursorEnd:this.memo.cursorEnd})}).then(function(e){return e.json()}).then(function(t){e.user.currentFile=t.body.title,e.memo.content=t.body.content,e.showList()})},deleteMemo:function(){var e=this;fetch("http://localhost:8080/memo/".concat(this.user.nickname,"/").concat(this.user.currentFile),{method:"delete"}).then(function(e){return e.json()}).then(function(e){window.alert(e.body)}).then(function(){e.showList(),e.memo.content=""})}}}),u=c,l=(n("d1f1"),n("2877")),m=Object(l["a"])(u,i,a,!1,null,"9e802ba4",null);m.options.__file="Notepad.vue";var d=m.exports,p={name:"app",components:{Notepad:d}},h=p,f=(n("034f"),Object(l["a"])(h,r,s,!1,null,null,null));f.options.__file="App.vue";var v=f.exports,g=n("8c4f"),w=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("form",{attrs:{method:"post"}},[e.signupMsgShow?n("div",[e._v(e._s(e.signupMsg))]):e._e(),n("fieldset",[n("legend",[e._v("Sign up")]),n("div",[e._v("NICKNAME")]),n("input",{directives:[{name:"model",rawName:"v-model",value:e.nickname,expression:"nickname"}],attrs:{type:"text",name:"nickname",placeholder:"What should we call you?"},domProps:{value:e.nickname},on:{input:function(t){t.target.composing||(e.nickname=t.target.value)}}}),n("div",[e._v("EMAIL")]),n("input",{directives:[{name:"model",rawName:"v-model",value:e.email,expression:"email"}],attrs:{type:"text",name:"email",placeholder:"Enter your email address"},domProps:{value:e.email},on:{input:function(t){t.target.composing||(e.email=t.target.value)}}}),n("div",[e._v("PASSWORD")]),n("input",{directives:[{name:"model",rawName:"v-model",value:e.pwd,expression:"pwd"}],attrs:{type:"password",name:"pwd",placeholder:"Enter your password"},domProps:{value:e.pwd},on:{input:function(t){t.target.composing||(e.pwd=t.target.value)}}}),n("div",[e._v("PASSWORD AGAIN")]),n("input",{directives:[{name:"model",rawName:"v-model",value:e.checkpwd,expression:"checkpwd"}],attrs:{type:"password",name:"checkpwd",placeholder:"Enter your password once more"},domProps:{value:e.checkpwd},on:{input:function(t){t.target.composing||(e.checkpwd=t.target.value)}}}),n("input",{attrs:{type:"submit",value:"Sign me up!"},on:{click:e.signup}})])])},y=[],b={name:"Signup",data:function(){return{nickname:"",email:"",pwd:"",checkpwd:"",signupMsg:"",signupMsgShow:!1}},methods:{signup:function(e){var t=this;e.preventDefault();var n=new Headers;n.append("Content-Type","application/json"),fetch("http://localhost:8080/signup",{method:"post",headers:n,body:JSON.stringify({nickname:this.nickname,email:this.email,pwd:this.pwd,checkpwd:this.checkpwd})}).then(function(e){return e.json()}).then(function(e){if(!e.success)return t.signupMsg=e.body,void(t.signupMsgShow=!0);j.push({name:"Memomemo"});var n=[t.email,t.pwd];t.$bus.emit("login",n)})}}},S=b,k=(n("7292"),Object(l["a"])(S,w,y,!1,null,"6f723984",null));k.options.__file="Signup.vue";var _=k.exports;o["a"].use(g["a"]);var M=new g["a"]({routes:[{path:"/",name:"Memomemo",component:d},{path:"/signup",name:"signup",component:_}]}),j=M;o["a"].config.productionTip=!1,new o["a"]({router:j,render:function(e){return e(v)}}).$mount("#app");var x=new o["a"];Object.defineProperties(o["a"].prototype,{$bus:{get:function(){return x}}})},"64a9":function(e,t,n){},7292:function(e,t,n){"use strict";var o=n("0580"),r=n.n(o);r.a},d1f1:function(e,t,n){"use strict";var o=n("d658"),r=n.n(o);r.a},d658:function(e,t,n){}});
//# sourceMappingURL=app.98a3e87f.js.map