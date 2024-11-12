const connection = require("../db/db");

async function login(params) {
  let sql = `select au.id as uuid ,au.username as id , au.password,au.first_name as name from auth_user au where au.username = ?;`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function signin(params) {
  let sql = `insert into auth_user (username,password,first_name) values (?,?,?)`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getAllUser() {
  let sql = `select au.username from auth_user au;`;
  try {
    const [rows, fields] = await connection.query(sql);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function checkUserId(params) {
  let sql = `select au.username from auth_user au where au.username = ?`;
  try {
    const [rows, fields] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  login,
  signin,
  getAllUser,
  checkUserId,
};
