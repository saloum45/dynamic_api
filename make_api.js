const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const DatabaseHandler = require('./DatabaseHandler');
// const base_specificity = new require('./base_specificity');
app.use(express.json());

app.get('/generate', async (req, res) => {
    const dbHandler = new DatabaseHandler();
    // const base_specificity = require('./base_specificity'); // Your custom base_specificity class
    let params = req.body || {};

    // base_specificity.allowCors();

    let response = {
        status: false,
        erreur: null,
        data: {
            all_tables: false,
            specificity: false,
            // get_form_details: false,
            store: false,
            delete: false,
            update: false,
            show: false,
            index: false,
        }
    };

    // if (!params || Object.keys(params).length === 0) {
    //     response.erreur = "Parameters required";
    //     return res.json(response);
    // }

    const generate = async (tableName) => {
        try {
            // const tableDir = `./${tableName}`;
            // if (!fs.existsSync(tableDir)) {
            //     fs.mkdirSync(tableDir);
            // }

            // Update specificityuration file and create it
            // const specificityContent = fs.readFileSync('./base/specificity.js', 'utf8')
            //     .replace('{{{table_name}}}', tableName);

            // if (!fs.existsSync(path.join(tableDir, 'specificity.js'))) {
            //     fs.writeFileSync(path.join(tableDir, 'specificity.js'), specificityContent);
            //     response.data.specificity = true;
            // }

            // Generate referenced table queries
            // const tableDescriptions = await base_specificity.getTableDescriptions(tableName, [tableName]);
            // const referencedTablesQueries = tableDescriptions.les_referenced_table.map(uneTable => {
            //     return `$response["data"]["les_${uneTable}s"] = base_specificity.getDb().query("SELECT * FROM ${uneTable}").fetchAll();`;
            // }).join('\n');

            // const formDetailsContent = fs.readFileSync('./base/get_form_details.js', 'utf8')
            //     .replace('/*{{content}}*/', referencedTablesQueries);

            // if (!fs.existsSync(path.join(tableDir, 'get_form_details.js'))) {
            //     fs.writeFileSync(path.join(tableDir, 'get_form_details.js'), formDetailsContent);
            //     response.data.get_form_details = true;
            // }

            // Copying other base endpoints like store, delete, update, get, index
            // const apiFiles = ['store', 'delete', 'update', 'get', 'index'];
            // for (const apiFile of apiFiles) {
            //     const filePath = path.join(tableDir, `${apiFile}.js`);
            //     if (!fs.existsSync(filePath)) {
            //         fs.copyFileSync(`./base/${apiFile}.js`, filePath);
            //         response.data[apiFile] = true;
            //     }
            // }

            response.status = true;
        } catch (err) {
            response.status = false;
            response.erreur = err.message;
        }
    };

    try {
        // if (params.tout) {
            // const query = "SHOW TABLES";
            // const tables = await base_specificity.getDb().query(query);
            // for (const tableObj of tables[0]) {
            //     const tableName = tableObj[`Tables_in_${base_specificity.databaseName}`];
            //     await generate(tableName);
            // }
            // response.status = true;
            // response.data.all_tables = true;
        // } else if (params.table) {
        //     const tableName = params.table;
        //     await generate(tableName);
        //     response.status = true;
        //     response.data.all_tables = false;
        // }
        // Se connecter à la base de données
        await dbHandler.connect();

        // Récupérer les tables
        const tables = await dbHandler.getTables();
        console.log('Tables de la base de données :', tables);
        res.json(tables);
    } catch (err) {
        response.status = false;
        response.erreur = err.message;
        res.json(response);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
