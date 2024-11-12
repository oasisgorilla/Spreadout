const connection = require("../db/db");

async function createNewSession(params) {
  let sql = `insert into api_session (chapter_id, user_id) values(?,?);`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function createNewSessionLinks(params) {
  let sql = `insert into api_sessionconnection (similarity, source, target, pdf_file_id) values	(1,?,?,(select ac.pdf_file_id from api_chapter ac where ac.id = ?));`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function selectSession(params) {
  let sql = `select as2.id, as2.chapter_id,ac.group,as2.user_id from api_session as2 join api_chapter ac on as2.chapter_id =ac.id where ac.pdf_file_id =?;`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}
async function selectSessionLinks(params) {
  let sql = `select * from api_sessionconnection as2 where as2.pdf_file_id =?;`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function selectSessionDetail(params) {
  let sql = `select as2.content from api_session as2 where as2.id =?;`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateSessionDetail(params) {
  let sql = `UPDATE api_session as2 SET as2.content = ? where as2.id =?;`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

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

module.exports = {
  createNewSession,
  createNewSessionLinks,
  selectSession,
  selectSessionLinks,
  selectSessionDetail,
  updateSessionDetail,
  deleteChat,
};
