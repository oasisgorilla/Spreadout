var express = require("express");
var router = express.Router();
var elastic = require("../db/elastic");
// let llm = require("../ai/llm");

/* GET home page. */
router.get("/", async function (req, res, next) {
  res.render("index", { title: "Express" });
});
// router.get("/", llm);

router.get("/test-cookie", (req, res) => {
  const cookies = req.cookies;
  console.log("Cookies: ", cookies);
  const token = req.cookies.token;
  console.log("Token: ", token);
  var visitors = req.cookies.visitors || 0;
  console.log("visitors:", visitors);
  visitors++;
  res.cookie("visitors", visitors, {
    httpOnly: true,
    // secure: true,
    // sameSite: "None", // 이 옵션은 CSRF 공격을 방지하는 데 도움을 줍니다.
    maxAge: 24 * 60 * 60 * 1000, // 쿠키의 만료 시간 (예: 24시간)
  });
  res.status(200).send({ message: "Cookie values logged on server" });
});

module.exports = router;
