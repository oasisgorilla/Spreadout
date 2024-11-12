// const { Client } = require("@elastic/elasticsearch");
// const client = new Client({
//   node: "http://localhost:9200",
//   auth: {
//     username: "elastic",
//     password: "123456",
//   },
//   //   tls:n  //     ca: fs.readFileSync("./http_ca.crt"),
//   //     rejectUnauthorized: false,
//   //   },
// });

// // const client = new Client({
// //   node: "http://localhost:9200",
// //   maxRetries: 5,
// //   requestTimeout: 60000,
// //   sniffOnStart: true,
// // });

// async function bootstrap() {
//   try {
//     client.ping();
//     console.log("9200번 포트 연결");
//   } catch (e) {
//     console.log(e);
//   }
// }
// // bootstrap();

// async function find(keyword) {
//   const query = keyword;
//   const elastic = client;
//   try {
//     const data = await elastic.search({
//       index: "books",
//       query: {
//         match: {
//           name: "brave",
//         },
//       },
//     });
//     //임시로 return 값은 query로 설정
//     // return query;
//     return data;
//   } catch (error) {
//     console.log(error);
//   }
// }

// module.exports = {
//   bootstrap,
//   find,
// };
