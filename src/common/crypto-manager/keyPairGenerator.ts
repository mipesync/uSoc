const NodeRSA = require('node-rsa');
const key = new NodeRSA({ b: 2048 });

let public_key = key.exportKey('public');
let private_key = key.exportKey('private');

console.log(process.env.PRIVATE_KEY);
