# Memo Memo
![memomemo](https://user-images.githubusercontent.com/22453170/49988860-b1b20000-ffbb-11e8-8733-a5363753224e.png)
- 유저별로 메모를 작성할 수 있는 서비스
- **Language**: 
  - **Front-End**: HTML, CSS, Vanilla JavaScript, VueJS
  - **Back-End**: Node.js, Express.js
  - **Deployment**: AWS S3(Front-End), EC2(Back-End), RDS (DB)
- **Implementation**:
  - 회원가입
  - 로그인/로그아웃
  - 로그인 성공시 가장 최근에 작업했던 내용을 로드 (메모 내용, 커서)
  - JWT token 활용하여 로그인 유지
  - Memo CRUD
  - 테스트 코드 추가 (Auth 관련 테스트 커버리지 98%) 및 그 외 기능 추가중!
  - **[demo 페이지로 이동](http://memomemo-www.s3-website.ap-northeast-2.amazonaws.com/#/)** 

# sequelize-cli migration
1. migration 파일 생성  
`sequelize migration:create --name addWorkedOnLast`
2. migration 파일 작성 (migrations/해당 파일 내 up/down 작성)   
3. migration 실행 (기본 config 파일 위치: config/config.json, **위치가 다를 경우 아래처럼 지정해줄 것!**)    
`sequelize db:migrate --config models/config/sequelize.json`
4. 완료되면 models 실제 파일에도 추가하기 (추후 운영 용이)  
[참고] migrations 파일을 SequelizeMeta 테이블에서 체크하고 migration 관리함  
