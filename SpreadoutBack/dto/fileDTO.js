const connection = require("../db/db");

async function insertPdfInfo(params) {
  let sql = `INSERT into jungle_file (name, userId_id,url) values(?,?,?)`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function readPdfInfo(params) {
  let sql = `select * from api_pageconnection ap where ap.pdf_file_id = ? AND  bookmarked = 0;`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function readPdfUrl(params) {
  let sql = `select ap.url from api_pdffile ap where ap.id =?;`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function readPdfNode(params) {
  let sql = `select ac.id, ac.name, ac.start_page, ac.end_page, ac.level, ac.bookmarked, ac.group, ac.pdf_file_id, ac.summary, ac.keywords, ap.filename from api_chapter ac left join api_pdffile ap ON ac.pdf_file_id=ap.id where ac.pdf_file_id =?;`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function readPdfListFromUser(params) {
  let sql = `select * from api_pdffile ap where ap.user_id =?;`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getBookmark(params) {
  let sql = `select * from api_chapter ac where ac.pdf_file_id = ? and ac.bookmarked = 1;`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getBookmarkConnect(params) {
  let sql = `select * from api_pageconnection ap where ap.pdf_file_id = ? and ap.bookmarked = 1;`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateBookmark(params) {
  let sql = `update api_chapter ac set ac.bookmarked =? where ac.id=?;`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function createConnection(params) {
  let sql = `insert into api_pageconnection(source, target, pdf_file_id, bookmarked) values(?,?,?,1);`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function deleteConnection(params) {
  let sql = `delete from api_pageconnection ap where ap.id=?;`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function createCustomConnection(params) {
  let sql = `insert into api_customeconnection (source, target, pdf_file_id, user_id,name) values(?,?,?,?,?);`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function readCustomConnection(params) {
  let sql = `select ac.name from api_customeconnection ac where ac.pdf_file_id = ? and ac.user_id = ? GROUP BY ac.name;`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function readCustomConnectionDetail(params) {
  let sql = `select * from api_customeconnection ac where ac.pdf_file_id =? and ac.user_id = ? and ac.name =? ;`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function selectcircle(params) {
  let sql = `select ac.keywords from api_chapter ac where ac.pdf_file_id =?;`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  insertPdfInfo,
  readPdfInfo,
  readPdfUrl,
  readPdfNode,
  readPdfListFromUser,
  getBookmark,
  updateBookmark,
  getBookmarkConnect,
  createConnection,
  deleteConnection,
  createCustomConnection,
  readCustomConnection,
  readCustomConnectionDetail,
  selectcircle,
};
