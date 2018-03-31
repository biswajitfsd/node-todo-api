const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

var data = {
  id: 4
};

var token = jwt.sign(data, 'apikey');
console.log(token);

var decode = jwt.verify(token, 'apikey');
console.log(decode);

// var message = 'I am Biswajit';
// var hash = SHA256(message).toString();
//
// console.log(`Message string: ${message}`);
// console.log(`Hased message string: ${hash}`);
//
// var data = {
//   id: 4
// };
//
// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'apikey').toString()
// };
//
// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();
//
// var resultHash = SHA256(JSON.stringify(token.data) + 'apikey').toString();
//
// if(resultHash === token.hash) {
//   console.log('Data was not changed.');
// } else {
//   console.log('Data was tempered.');
// }
