const TafAuth = require('Taf').TafAuth;
const TableQuery = require('Taf').TableQuery;
const config = require('./config');
const TafConfig = require('Taf').TafConfig;

try {
    const tafAuth = new TafAuth();
    const tafConfig = new TafConfig();
    const tableQuery = new TableQuery(tableName);
    let response = {};

    // Toutes les actions nécessitent une authentification
    const authResponse = tafAuth.checkAuth(response);
    if (!authResponse.status) {
        console.log(JSON.stringify(authResponse));
        process.exit();
    }

    // Les paramètres envoyés via POST
    let params = req.body;

    if (!params || Object.keys(params).length === 0) {
        response.status = false;
        response.erreur = "Parameters required";
        console.log(JSON.stringify(response));
        return;
    }

    // Récupération de la clé primaire de la table pour la condition de modification
    const queryPrimaryKey = `SHOW KEYS FROM ${tableName} WHERE Key_name = 'PRIMARY'`;
    tafConfig.getDb().query(queryPrimaryKey, (err, result) => {
        if (err) {
            response.status = false;
            response.erreur = err.message;
            console.log(JSON.stringify(response));
            return;
        }

        const primaryKey = result[0].Column_name;
        const condition = `WHERE ${primaryKey} = ${params[primaryKey]}`;

        // Exécution de la requête de suppression
        const query = `DELETE FROM ${tableName} ${condition}`;
        tafConfig.getDb().exec(query, (err, result) => {
            if (err) {
                response.status = false;
                response.erreur = `Erreur ${err.message}`;
            } else {
                response.status = true;
            }
            console.log(JSON.stringify(response));
        });
    });

} catch (err) {
    response.status = false;
    response.erreur = err.message;
    console.log(JSON.stringify(response));
}
