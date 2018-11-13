# sequelize-cli migration
1. migration 파일 생성  
`sequelize migration:create --name addWorkedOnLast`
2. migration 파일 작성 (migrations/해당 파일 내 up/down 작성)   
3. migration 실행 (기본 config 파일 위치: config/config.json, **위치가 다를 경우 아래처럼 지정해줄 것!**)    
`sequelize db:migrate --config models/config/sequelize.json`
4. 완료되면 models 실제 파일에도 추가하기 (추후 운영 용이)  
[참고] migrations 파일을 SequelizeMeta 테이블에서 체크하고 migration 관리함  
