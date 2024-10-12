const TafAuth = require('Taf').TafAuth;
const base_queries = require('Taf').base_queries;
const TafConfig = require('Taf').TafConfig;

try {
    const tafAuth = new TafAuth();
    const tafConfig = new TafConfig();
    const base_queries = new base_queries(tableName);
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

    // Condition sur la modification
    const condition = base_queries.dynamicCondition(params.condition, '=');

    // Exécution de la requête de modification
    const query = base_queries.dynamicUpdate(params.data, condition);
    
    tafConfig.getDb().exec(query, (err, result) => {
        if (err) {
            response.status = false;
            response.erreur = `Erreur! ${err.message}`;
        } else if (result) {
            response.status = true;
        } else {
            response.status = false;
            response.erreur = "Erreur! ou pas de modification";
        }
        console.log(JSON.stringify(response));
    });

} catch (err) {
    response.status = false;
    response.erreur = err.message;
    console.log(JSON.stringify(response));
}
