import newman from 'newman'; // require Newman in your project

import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

const API_KEY = process.env["POSTMAN_API_KEY"];
if (!API_KEY) {
    throw new Error("POSTMAN_API_KEY not provided");
}

// call newman.run to pass `options` object and wait for callback
newman.run({
    collection: `https://api.getpostman.com/collections/1791783-90c52994-592a-4f2b-accc-fbc9e4f42538?apikey=${API_KEY}`,
    reporters: 'cli',
    insecure: true,
}, function (err, summary) {
    if (err) { throw err; }
    console.log('collection run complete!');
});