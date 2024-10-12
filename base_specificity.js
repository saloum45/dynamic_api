const mysql = require('mysql2/promise');
const moment = require('moment');

class TafConfig {
    constructor() {
        this.databaseType = "mysql"; // Can be "mysql" | "pgsql" | "sqlsrv"
        this.host = "localhost"; 
        this.port = 3306; // 3306 for mysql, 5432 for pgsql, 1433 for sqlsrv
        this.databaseName = "ammo1331_bi"; 
        this.user = "ammo1331_bi"; 
        this.password = "(4M]ex&mz(33"; 
        this.tables = [];
        this.connected = false;
        this.dbInstance = null;
        this.initData();
    }

    async initData() {
        if (this.tables.length === 0 && await this.isConnected()) {
            switch (this.databaseType) {
                case 'mysql':
                    const [rows] = await this.getDb().query("SHOW TABLES");
                    this.tables = rows.map(row => Object.values(row)[0]);
                    break;
                // Add cases for pgsql, sqlsrv if needed
            }
        }
    }

    async isConnected() {
        await this.getDb();
        return this.connected;
    }

    async getDb() {
        if (!this.dbInstance) {
            try {
                this.dbInstance = await mysql.createConnection({
                    host: this.host,
                    port: this.port,
                    user: this.user,
                    password: this.password,
                    database: this.databaseName
                });
                this.connected = true;
            } catch (err) {
                console.error(err);
                this.connected = false;
            }
        }
        return this.dbInstance;
    }

    // Helper method for CORS headers (used in APIs)
    allowCors(req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "*");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "*");
    }

    // Documentation Authentication
    verifyDocumentationAuth(username, password) {
        return username === "admin" && password === "1234ammo1331_bi";
    }

    getBaseUrl(req) {
        const protocol = req.secure ? 'https' : 'http';
        return `${protocol}://${req.get('host')}${req.baseUrl}`;
    }

    async getTableDescriptions(tableName, basedTableNames = []) {
        const result = {
            tableName,
            primaryKey: "",
            basedTableNames,
            referencedTables: [],
            columns: []
        };

        const [columns] = await this.getDb().query(`DESCRIBE ${tableName}`);
        result.columns = columns;

        for (let column of result.columns) {
            if (column.Key === "PRI") {
                column.explications = "Primary Key";
                result.primaryKey = column;
            } else if (column.Key === "MUL") {
                const foreignKey = column.Field;
                const query = `
                    SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                    WHERE CONSTRAINT_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL
                    AND TABLE_NAME = ? AND COLUMN_NAME = ?`;

                const [foreignTable] = await this.getDb().execute(query, [this.databaseName, tableName, foreignKey]);
                column.table = foreignTable[0];
                column.explications = `Foreign Key linked to ${column.table.REFERENCED_COLUMN_NAME} in ${column.table.REFERENCED_TABLE_NAME}`;

                // Avoid circular references
                if (basedTableNames.includes(column.table.REFERENCED_TABLE_NAME)) {
                    column.tableExistant = true;
                } else {
                    basedTableNames.push(column.table.REFERENCED_TABLE_NAME);
                    column.referencedTable = await this.getTableDescriptions(column.table.REFERENCED_TABLE_NAME, basedTableNames);
                }
            }
        }

        return result;
    }

    log(params) {
        params.ip = this.getUserIP();
        const columns = Object.keys(params).join(", ");
        const values = Object.values(params).map(value => value ? `'${value}'` : 'null').join(", ");

        const query = `INSERT INTO log (${columns}) VALUES (${values})`;
        this.getDb().execute(query);
    }

    getUserIP(req) {
        return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    }

    // Date formatting using moment.js
    formatDate(dateString) {
        return {
            full: moment(dateString).locale("fr").format("dddd Do MMMM YYYY"),
            jma: moment(dateString).locale("fr").format("Do MMMM YYYY"),
            jma2: moment(dateString).locale("fr").format("DD-MM-YYYY"),
            jma3: moment(dateString).locale("fr").format("YYYY-MM-DD"),
            fullDateTime: moment(dateString).locale("fr").format("dddd Do MMMM YYYY à HH:mm"),
        };
    }

    formatCurrentDate() {
        return this.formatDate(new Date());
    }
}

module.exports = TafConfig;
