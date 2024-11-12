require("dotenv").config();
const jwt = require("jsonwebtoken");

function checkAuth(req, res, next) {
  // console.log(req.headers);
  // console.log(req.headers.token);
  let token = req.headers.token;
  if (!token) {
    console.log("포스트맨 요청");
    // console.log(req.cookies);
    token = req.cookies.token;
  }
  // console.log("ht: ", token);
  if (!token) {
    return res.status(401).send({result:"인증 토큰이 없습니다."});
    z;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // decoded 정보를 요청 객체에 저장
    next(); // 다음 미들웨어 또는 라우트 핸들러로 이동
  } catch (error) {
    return res.status(401).send("유효하지 않은 토큰입니다.");
  }
}

function makeToken(tokenInfo) {
  const payload = {
    userName: tokenInfo[0].name,
    userId: tokenInfo[0].id,
    uuid: tokenInfo[0].uuid,
  };
  return (token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "20000h",
  }));
}

module.exports = {
  makeToken,
  checkAuth,
};
