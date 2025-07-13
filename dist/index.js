"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const app = (0, express_1.default)();
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ time: result.rows[0].now });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
