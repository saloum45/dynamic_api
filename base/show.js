const TafAuth = require('Taf').TafAuth;
const base_queries = require('Taf').base_queries;
const TafConfig = require('Taf').TafConfig;

try {
    const tafAuth = new TafAuth();
    const tafConfig = new TafConfig();
    const base_queries = new base_queries(tableName);
    let response = {};

    // Les paramètres envoyés via POST
    let params = req.body;

    // Toutes les actions nécessitent une authentification
    const authResponse = tafAuth.checkAuth();
    if (!authResponse.status && (!params || Object.keys(params).length === 0)) {
        console.log(JSON.stringify(authResponse));
        process.exit();
    }

    // Génération de la condition dynamique
    const condition = base_queries.dynamicCondition(params, '=');

    // Construction et exécution de la requête SELECT
    const query = `SELECT * FROM ${tableName} ${condition}`;
    tafConfig.getDb().query(query, (err, result) => {
        if (err) {
            response.status = false;
            response.erreur = err.message;
        } else {
            response.data = result;
            response.status = true;
        }
        console.log(JSON.stringify(response));
    });

} catch (err) {
    response.status = false;
    response.erreur = err.message;
    console.log(JSON.stringify(response));
}
