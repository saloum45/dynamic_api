// databaseHandler.js

const mysql = require('mysql2/promise');

class DatabaseHandler {
    constructor() {
        this.host = 'localhost';
        this.user = 'root';
        this.password = '';
        this.database = 'dynamic_api';
        this.connection = null;
        this.connect();
    }

    // Méthode pour se connecter à la base de données
    async connect() {
        try {
            this.connection = await mysql.createConnection({
                host: this.host,
                user: this.user,
                password: this.password,
                database: this.database
            });
            console.log('Connexion réussie à la base de données.');
        } catch (error) {
            console.error('Erreur de connexion à la base de données :', error);
            throw error;
        }
    }

    // Méthode pour récupérer les tables
    async getTables() {
        if (!this.connection) {
            throw new Error('Pas de connexion à la base de données.');
        }

        try {
            const [rows] = await this.connection.query('SHOW TABLES');
            const tables = rows.map(row => Object.values(row)[0]);
            return tables;
        } catch (error) {
            console.error('Erreur lors de la récupération des tables :', error);
            throw error;
        }
    }

    // Méthode pour fermer la connexion
    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            console.log('Connexion fermée.');
        }
    }
    
}

module.exports = DatabaseHandler;
