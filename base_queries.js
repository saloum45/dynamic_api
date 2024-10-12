class base_queries {
    constructor(tableName) {
        this.tableName = tableName;
        this.description = [];
    }

    dynamicCondition(dataCondition, operation) {
        if (!dataCondition || Object.keys(dataCondition).length === 0) {
            return '';
        }
        const conditions = Object.entries(dataCondition).map(([key, value]) => {
            return `${this.escape(key)} ${operation} '${this.escape(value)}'`;
        });
        return `WHERE ${conditions.join(' AND ')}`;
    }

    dynamicInsert(assocArray) {
        const keys = [];
        const values = [];

        for (const [key, value] of Object.entries(assocArray)) {
            keys.push(this.escapeHtml(key));
            if (value === '') {
                values.push('null');
            } else if (Array.isArray(value)) {
                values.push(`'${JSON.stringify(value)}'`);
            } else {
                values.push(`'${this.escapeHtml(value)}'`);
            }
        }
        return `INSERT INTO ${this.tableName}(${keys.join(',')}) VALUES(${values.join(',')})`;
    }

    dynamicInsert_2(assocArray) {
        const keys = [];
        const values = [];

        for (const [key, value] of Object.entries(assocArray)) {
            keys.push(this.escapeHtml(key));
            if (Array.isArray(value)) {
                const jsonValue = JSON.stringify(value);
                const escapedJsonValue = this.escape(jsonValue);
                values.push(`'${escapedJsonValue}'`);
            } else if (value === '') {
                values.push('null');
            } else {
                values.push(`'${this.escapeHtml(value)}'`);
            }
        }
        return `INSERT INTO ${this.tableName}(${keys.join(',')}) VALUES(${values.join(',')})`;
    }

    dynamicInsert2(array) {
        const keys = [];
        const values = [];

        for (const value of array) {
            keys.push(this.escapeHtml(value.field));
            if (value === '') {
                values.push('null');
            } else {
                values.push(`'${this.escapeHtml(value.valeur)}'`);
            }
        }
        return `INSERT INTO ${this.tableName}(${keys.join(',')}) VALUES(${values.join(',')})`;
    }

    dynamicManyInsert(tableName, simpleArray, keys) {
        const rows = simpleArray.map(row => {
            const values = row.map(value => {
                if (value === '') {
                    return 'null';
                } else {
                    return `'${this.escapeHtml(value)}'`;
                }
            });
            return `(${values.join(',')})`;
        });
        return `INSERT INTO ${tableName}(${keys.join(',')}) VALUES ${rows.join(', ')}`;
    }

    dynamicUpdate(assocArray, condition) {
        const keyValuePairs = Object.entries(assocArray).map(([key, value]) => {
            if (value === '') {
                return `${this.escape(key)} = null`;
            } else {
                return `${this.escape(key)} = '${this.escape(value)}'`;
            }
        });
        return `UPDATE ${this.tableName} SET ${keyValuePairs.join(',')} ${condition}`;
    }

    dynamicUpdate_2(assocArray, condition) {
        const keyValuePairs = Object.entries(assocArray).map(([key, value]) => {
            const escapedKey = this.escapeHtml(key);
            if (Array.isArray(value) || typeof value === 'object') {
                const jsonValue = JSON.stringify(value);
                const escapedJsonValue = this.escape(jsonValue);
                return `${escapedKey} = '${escapedJsonValue}'`;
            } else if (value === '') {
                return `${escapedKey} = null`;
            } else {
                return `${escapedKey} = '${this.escapeHtml(value)}'`;
            }
        });
        return `UPDATE ${this.tableName} SET ${keyValuePairs.join(',')} ${condition}`;
    }

    // Helper methods to escape strings and HTML
    escape(value) {
        return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }

    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

module.exports = base_queries;
