var express = require("express");
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
var router = express.Router();
const userDTO = require("../dto/userDTO");
const fileDTO = require("../dto/fileDTO");
const botDTO = require("../dto/botDTO");
// import imageUploader from "../aws";
const imageUploader = require("../aws");
const uath = require("../auth");

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

// AWS.config.update({
//   region: process.env.AWS_REGION,
//   accessKeyId: process.env.S3_ACCESS_KEY,
//   secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
// });

const downloadFile = (bucketName, key, res) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };
  s3.getObject(params).createReadStream().pipe(res);
};

// 데이터 조회
// router.post("/", uath.checkAuth, async (req, res, next) => {
router.get("/", async (req, res, next) => {
  if (req.query == undefined) {
    res.status(500).send({ error: "not found req.body" });
  } else {
    const params = [req.query.pdfId];
    let oldnodes = await fileDTO.readPdfNode(params);
    let nodes = [];
    let links = await fileDTO.readPdfInfo(params);
    let url = await fileDTO.readPdfUrl(params);
    let session_nodes = [];
    let session_links = [];
    let nodelen = oldnodes.length;
    if (nodelen > 0) {
      // 필요없는 노드 제거
      let nodeFillter = [];
      for (let i = 0; i < links.length; i++) {
        nodeFillter.push(links[i].source);
      }
      nodeFillter = [...new Set(nodeFillter)];
      for (let i = 0; i < oldnodes.length; i++) {
        if (
          nodeFillter.includes(oldnodes[i].id) ||
          oldnodes[i].level > 1 ||
          oldnodes[i].name.includes("서문") ||
          oldnodes[i].name.includes("프롤로그") ||
          oldnodes[i].name.includes("에필로그")
        ) {
          nodes.push(oldnodes[i]);
        }
      }
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].keywords = JSON.parse(nodes[i].keywords);
      }
      // // 키워드 추가
      // let lastnum = oldnodes[oldnodes.length - 1].id;
      // for (let i = 0; i < nodes.length; i++) {
      //   let arr = JSON.parse(nodes[i].keywords);
      //   // console.log("nodes" + i + ": ", nodes[i]);
      //   // console.log("arr: ", arr);

      //   if (arr != null) {
      //     for (let j = 0; j < arr.length; j++) {
      //       lastnum++;
      //       session_nodes.push({
      //         id: lastnum,
      //         name: arr[j],
      //         start_page: 0,
      //         end_page: 0,
      //         level: 10,
      //         bookmarked: 0,
      //         group: nodes[i].group,
      //         pdf_file_id: nodes[i].pdf_file_id,
      //         summary: null,
      //         keywords: null,
      //       });
      //       session_links.push({
      //         id: 0,
      //         similarity: 1,
      //         source: lastnum,
      //         target: nodes[i].id,
      //         pdf_file_id: nodes[i].pdf_file_id,
      //         bookmarked: 0,
      //       });
      //     }
      //   }
      // }

      if (!url.length > 0) {
        res.status(400).send({ result: "해당 번호 결과 없음" });
        return;
      }
      let result = {
        url: url[0].url,
        nodes: nodes,
        links: links,
        session_nodes: session_nodes,
        session_links: session_links,
      };
      res.status(200).send(result);
    } else {
      let result = {
        url: null,
        nodes: [],
        links: [],
        session_nodes: [],
        session_links: [],
      };
      res.status(200).send(result);
    }
  }
});

// pdf 목록 조회
router.get("/list", uath.checkAuth, async (req, res, next) => {
  if (req.query == undefined) {
    res.status(500).send({ error: "not found req.body" });
  } else {
    console.log(req.user);
    const params = [req.user.uuid];
    let node = await fileDTO.readPdfListFromUser(params);

    let result = {
      user: node,
    };
    res.status(200).send(result);
  }
});

router.get("/bookmark", uath.checkAuth, async (req, res, next) => {
  if (req.query == undefined) {
    res.status(500).send({ error: "not found req.body" });
  } else {
    let session_nodes = [];
    let session_links = [];
    const params = [req.query.pdfId];
    let url = await fileDTO.readPdfUrl(params);
    let nodes = await fileDTO.getBookmark(params);

    let links = await fileDTO.getBookmarkConnect(params);
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].keywords = JSON.parse(nodes[i].keywords);
    }
    // // 키워드 추가
    // let lastnum = nodes[nodes.length - 1].id;
    // for (let i = 0; i < nodes.length; i++) {
    //   let arr = JSON.parse(nodes[i].keywords);
    //   // console.log("nodes" + i + ": ", nodes[i]);
    //   // console.log("arr: ", arr);

    //   if (arr != null) {
    //     for (let j = 0; j < arr.length; j++) {
    //       lastnum++;
    //       session_nodes.push({
    //         id: lastnum,
    //         name: arr[j],
    //         start_page: 0,
    //         end_page: 0,
    //         level: 10,
    //         bookmarked: 0,
    //         group: nodes[i].group,
    //         pdf_file_id: nodes[i].pdf_file_id,
    //         summary: null,
    //         keywords: null,
    //       });
    //       session_links.push({
    //         id: 0,
    //         similarity: 1,
    //         source: lastnum,
    //         target: nodes[i].id,
    //         pdf_file_id: nodes[i].pdf_file_id,
    //         bookmarked: 0,
    //       });
    //     }
    //   }
    // }
    if (url.length > 0) {
      url = url[0].url;
    } else {
      url = null;
    }
    let result = {
      url: url,
      nodes: nodes,
      links: links,
      session_nodes: session_nodes,
      session_links: session_links,
    };
    res.status(200).send(result);
  }
});

router.put("/bookmark", uath.checkAuth, async (req, res, next) => {
  if (req.body == undefined) {
    res.status(500).send({ error: "not found req.body" });
  } else {
    const params = [req.body.bookmarked, req.body.chapterId];
    let node = await fileDTO.updateBookmark(params);

    let result = {
      user: node,
    };
    res.status(200).send(result);
  }
});

router.post("/bookmark/connection", uath.checkAuth, async (req, res) => {
  if (
    req.body.source == undefined ||
    req.body.source == undefined ||
    req.body.pdfId == undefined
  ) {
    console.log(req.body);
    res.status(500).send({ error: " not found req.query" });
  } else {
    const params = [req.body.source, req.body.target, req.body.pdfId];
    let result = await fileDTO.createConnection(params);
    res.status(200).send(result);
  }
});

router.delete("/bookmark/connection", uath.checkAuth, async (req, res) => {
  if (req.query.connectionId == undefined) {
    res.status(500).send({ error: " not found req.query" });
  } else {
    const params = [req.query.connectionId];
    let result = await fileDTO.deleteConnection(params);
    res.status(200).send(result);
  }
});

router.get("/circle", async (req, res, next) => {
  if (req.query.pdfId == undefined) {
    res.status(500).send({ error: "not found req.body" });
  } else {
    const params = [req.query.pdfId];
    let result = await fileDTO.selectcircle(params);
    // console.log(result);
    result2 = mergeArrays(result);
    console.log(result2);
    res.status(200).send(result2);
  }
});

function mergeArrays(arrays) {
  const result = {};

  arrays.forEach((array) => {
    array.forEach((keywords) => {
      if (result[keywords]) {
        result[keywords] += 1;
      } else {
        result[keywords] = 1;
      }
    });
  });

  return result;
}

module.exports = router;
