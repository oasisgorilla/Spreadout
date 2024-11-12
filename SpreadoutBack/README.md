# **연관 페이지 추천 기능을 가진 PDF 뷰어 Spread out**

## 프로젝트 개요

- 프로젝트 기간 :  2024.06.24 ~ 2024.07.27 (5주)
- 프로젝트 설명
    - pdf 파일 형식의 책을 업로드 하면 책을 분석하여 점과 연결의 그래프로 보여주고 챕터간의 관계 및 요약, 키워드를 보여줍니다.
    - 추가로 업로드한 pdf를 읽은 챗봇을 통해서 책의 내용에 대해서 질문하거나 요약하는 등 llm을 사용한 서비스를 제공합니다.
- 프로젝트 배경 및 의도
    - 전공서적, 인문 서적 등 읽기 어려운 책을 좀 더 빠르고 쉽게 읽을 수 있으면 좋겠다는 생각에서 시작한 프로젝트 입니다.
    - 추가로 챕터간 함께 보면 좋은 챕터를 연결하여 좀 더 책을 깊이있게 읽을 수 있도록 했습니다.
    - 책에서 나오는 어려운 단어나 내용을 좀 더 쉽게 설명해줄 수 있는 도우미가 있었으면 좋겠다고 생각했습니다.
- 프로젝트 아키텍처

![image](https://github.com/user-attachments/assets/0b8cf4ee-c035-4bea-a385-7ddbd79df209)

## 기술스택

- 백엔드 : nodeJS, expressJS, MySQL, JWT,
- 기타 : github runner, docker , AWS EC2, AWS S3, Postman

## 프로젝트 진행 단계

- 백엔드
    - 회원가입, 로그인 등 사용자 관리, pdf 챕터 데이터 및 챕터 연결 데이터 조회, 수정,삭제 기능 을 ExpressJS 기반 API 구축
    - 로그인 후 JWT를 사용하여 API 사용시 권한 체크
    - MySQL 커넥션 풀을 이용하여 기존 커넥션을 활용할 수 있게 수정
- 기타
    - AWS EC2에 Docker를 기반으로 하나의 인스턴스에서 모든 서버(백엔드, 프론트엔드, AI, 챗봇, DB)가 돌아갈 수 있는 환경 구축
    - 백엔드, 프론트엔드, AI, 챗봇 서버를 Github Runner를 이용하여 자동 배포 환경 구축

## 프로젝트 세부 과정

### 백엔드

- 회원가입, 로그인 등 사용자 관리, pdf 챕터 데이터 및 챕터 연결 데이터 조회, 수정,삭제 기능 을 ExpressJS 기반 API 구축
    - ExpressJS를 선택한 이유
        1. nodeJS 프레임 워크중 가장 많이 사용되고 있어 예시를 찾기 쉬움
        2. nodeJS 백엔드 서버보단 챗봇 서버에 좀더 비중을 두고 개발하기 위해서 익숙한 기술 사용
    - 외래키로 연결된 데이터는 트랜잭션을 이용해서 삭제
    
    ```jsx
    async function deleteChat(params) {
      const conn = await connection.getConnection();
      try {
        await conn.beginTransaction();
    
        const sqlDeleteMessage = `DELETE FROM api_message WHERE session_id = ?;`;
        await conn.query(sqlDeleteMessage, params);
    
        const sqlDeleteSession = `DELETE FROM api_session WHERE id = ?;`;
        await conn.query(sqlDeleteSession, params);
    
        await conn.commit();
        console.log("Transaction committed successfully");
      } catch (err) {
        console.error("Failed to execute transaction:", err);
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    }
    ```
    
    - beginTransaction() 를 이용하여 트랜잭션을 시작하고 query로 보낼 쿼리를 저장후에 commit()으로 한번에 적용함
- 로그인 후 JWT를 사용하여 API 사용시 권한 체크
    - 세션과 JWT중 JWT를 선택한 이유
        - 서버측의 부하를 낮출 수 있음
        - 구현 난이도가 낮음
        - 토큰에 필요한 정보를 넣고 토큰만으로 어느 사용자의 요청인지 파악 가능
        - 확장성이 좋음(스케일 아웃에 대응하기 좋음)
    - 로그인 하지 않고 인증이 필요한 기능(PDF 목록 조회)을 요청했을 때 인증 토큰이 없다는 응답을 보내며 요청이 거부됨
    
    ![image](https://github.com/user-attachments/assets/60ba3f7a-cce4-4daa-9098-47f2aaa09d04)

    
    - 로그인 시 쿠키에 JWT 가 저장되며 API 요청 시 쿠키속에 토큰을 체크함
    
    ![image](https://github.com/user-attachments/assets/feaec5f9-dbcd-465f-8295-958c799e0a25)

    - 메인페이지에서 토큰를 받을 수 없는 문제 해결
        
        ```jsx
        res.cookie("token", token, {
                      httpOnly: true,
                      // secure: true,
                      // sameSite: "None",
                      maxAge: 24 * 60 * 60, // 쿠키의 만료 시간 (예: 24시간)
                    });
        ```
        
        - 문제 상황 : 로그인 후 전달한 쿠키속에 토큰을 브라우저에서 받지 못하는 문제가 발생
        - 원인 : 쿠키에 토큰을 넣고 보안이 걱정되서 **Secure 옵션을 설정함, 이렇게 하면 https로 요청을 전달하지 않으면 브라우저에서 set cookie 헤더를 통해서 쿠키를 설정하려는 시도가 차단됨,**
        - 임시 해결 : secure 옵션을 false로 하고 추후 https로 수정해서 다시 활성화 시킬 예정
        
- MySQL 커넥션 풀을 이용하여 기존 커넥션을 활용할 수 있게 수정
    
    ```bash
    const pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: "jungle",
      port: 3306,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
      keepAliveInitialDelay: 10000, // 
      enableKeepAlive: true, // 
    });
    ```
    
    - 문제 상황 : 오랜시간 DB에 요청이 없으면 나중에 다시 요청할 시 에러가 발생
    - 원인 추측 : 정확한 원인은 확인할 수 없었으나 동일 증상을 호소하는 글을 많이 찾을 수 있었고 MySQL2 라이브러리 개발자가 enableKeepAlive 을 true 로 하길 권장함
    - 해결 : 커넥션 풀을 사용해서 DB와의 연결을 계속 관리하고 KeepAlive 패킷을 보내서 연결을 지속적으로 유지하여 오랜시간 사용하지 않았을 때 DB 연결 요청이 실패하는 상황을 방지함

### 기타

- AWS EC2에 Docker를 기반으로 하나의 인스턴스에서 모든 서버(백엔드, 프론트엔드, AI, 챗봇, DB)가 돌아갈 수 있는 환경 구축
    - docker 를 사용한 이유
        1. 인스턴스에 띄워져 있는 서버를 한눈에 파악이 가능함
        2. github action, docker compose와 연계해서 간단하게 서버를 띄우고 내릴 수 있음
- 백엔드, 프론트엔드, AI, 챗봇 서버를 Github Action를 이용하여 자동 배포 환경 구축
    - Github Action를 사용한 이유
        1. Github와 연동하여 CI/CD를 구성하기 쉬움
        2. 추가적인 서버를 구성할 필요가 없음

## 프로젝트 결과
- 링크 : http://jungledaltong.shop/login
- git : https://github.com/WA360/SpreadoutBack
- 영상 : https://youtu.be/3ZoiSgs1TYE
