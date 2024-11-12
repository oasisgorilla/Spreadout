var express = require("express");
var router = express.Router();
let botDTO = require("../dto/botDTO");
const uath = require("../auth");

router.post("/session", async (req, res, next) => {
  try {
    let params = [req.body.chapterId, req.body.userId];
    let result = await botDTO.createNewSession(params);
    params = [result.insertId, req.body.chapterId, req.body.chapterId];
    let result2 = await botDTO.createNewSessionLinks(params);
    res.status(200).send({ sessionId: result.insertId });
  } catch (error) {
    res.status(501).send({ message: error });
  }
});

router.get("/session/detail", async (req, res, next) => {
  let params = [req.query.chapterId];
  try {
    let result = await botDTO.selectSessionDetail(params);
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).send({ message: error });
  }
});

router.put("/session/detail", async (req, res, next) => {
  let params = [req.body.content, req.body.chapterId];
  console.log(params);
  try {
    let result = await botDTO.updateSessionDetail(params);
    res.status(200).send({ message: result });
  } catch (error) {
    res.status(500).send({ message: error });
  }
});

module.exports = router;
