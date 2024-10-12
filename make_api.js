const express = require('express');
const fs = require('fs');
const path = require('path');
const base_specificity = require('./base_specificity'); // Your custom base_specificity class

const app = express();
app.use(express.json());

app.post('/generate', async (req, res) => {
    let params = req.body || {};

    const base_specificity = new base_specificity();
    base_specificity.allowCors();

    let response = {
        status: false,
        erreur: null,
        data: {
            all_tables: false,
            config: false,
            get_form_details: false,
            add: false,
            delete: false,
            edit: false,
            get: false,
            index: false,
        }
    };

    if (!params || Object.keys(params).length === 0) {
        response.erreur = "Parameters required";
        return res.json(response);
    }

    const generate = async (tableName) => {
        try {
            const tableDir = `./${tableName}`;
            if (!fs.existsSync(tableDir)) {
                fs.mkdirSync(tableDir);
            }

            // Update configuration file and create it
            const configContent = fs.readFileSync('./api/config.php', 'utf8')
                .replace('{{{table_name}}}', tableName);

            if (!fs.existsSync(path.join(tableDir, 'config.php'))) {
                fs.writeFileSync(path.join(tableDir, 'config.php'), configContent);
                response.data.config = true;
            }

            // Generate referenced table queries
            const tableDescriptions = await base_specificity.getTableDescriptions(tableName, [tableName]);
            const referencedTablesQueries = tableDescriptions.les_referenced_table.map(uneTable => {
                return `$response["data"]["les_${uneTable}s"] = base_specificity.getDb().query("SELECT * FROM ${uneTable}").fetchAll();`;
            }).join('\n');

            const formDetailsContent = fs.readFileSync('./api/get_form_details.php', 'utf8')
                .replace('/*{{content}}*/', referencedTablesQueries);

            if (!fs.existsSync(path.join(tableDir, 'get_form_details.php'))) {
                fs.writeFileSync(path.join(tableDir, 'get_form_details.php'), formDetailsContent);
                response.data.get_form_details = true;
            }

            // Copying other API endpoints like add, delete, edit, get, index
            const apiFiles = ['add', 'delete', 'edit', 'get', 'index'];
            for (const apiFile of apiFiles) {
                const filePath = path.join(tableDir, `${apiFile}.php`);
                if (!fs.existsSync(filePath)) {
                    fs.copyFileSync(`./api/${apiFile}.php`, filePath);
                    response.data[apiFile] = true;
                }
            }

            response.status = true;
        } catch (err) {
            response.status = false;
            response.erreur = err.message;
        }
    };

    try {
        if (params.tout) {
            const query = "SHOW TABLES";
            const tables = await base_specificity.getDb().query(query);
            for (const tableObj of tables[0]) {
                const tableName = tableObj[`Tables_in_${base_specificity.databaseName}`];
                await generate(tableName);
            }
            response.status = true;
            response.data.all_tables = true;
        } else if (params.table) {
            const tableName = params.table;
            await generate(tableName);
            response.status = true;
            response.data.all_tables = false;
        }
        res.json(response);
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
