const TafAuth = require('Taf').TafAuth;
const TafConfig = require('Taf').TafConfig;

try {
    const tafConfig = new TafConfig();
    const tableName = "{{{table_name}}}";
    let response = [];

    // Autoriser CORS
    tafConfig.allowCors();

    let params;
    if (req.body === "") {
        params = {};
    } else {
        params = JSON.parse(req.body);
    }
} catch (err) {
    console.error(`<h1>${err.message}</h1>`);
}
