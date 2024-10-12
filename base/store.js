const TafAuth = require('Taf').TafAuth;
const TableQuery = require('Taf').TableQuery;
const config = require('./config');
const TafConfig = require('Taf').TafConfig;

try {
    const tafAuth = new TafAuth();
    const tableQuery = new TableQuery(tableName);
    const tafConfig = new TafConfig();
    let response = {};

    // Toutes les actions nécessitent une authentification
    const authResponse = tafAuth.checkAuth();
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

    // Charger l'heure courante
    // params["date_enregistrement"] = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = tableQuery.dynamicInsert(params);

    // Exécution de la requête d'insertion
    tafConfig.getDb().exec(query, (err, result) => {
        if (err) {
            response.status = false;
            response.erreur = "Erreur d'insertion à la base";
            console.log(JSON.stringify(response));
            return;
        }

        response.status = true;
        params[`id_${tableName}`] = tafConfig.getDb().lastInsertId();
        response.data = params;
        console.log(JSON.stringify(response));
    });

} catch (err) {
    response.status = false;
    response.erreur = err.message;
    console.log(JSON.stringify(response));
}
