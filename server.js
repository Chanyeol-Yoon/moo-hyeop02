const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const buildServerPath = path.join(__dirname, 'dist', 'standalone', 'server.js');
const resolvedPort = process.env.PORT || '4000';
const resolvedHostname = process.env.HOST || '0.0.0.0';

process.env.PORT = resolvedPort;
process.env.HOSTNAME = resolvedHostname;
process.env.HOST = resolvedHostname;

if (fs.existsSync(buildServerPath)) {
    require(buildServerPath);
} else if (process.env.NODE_ENV === 'production') {
    console.error('Production build not found at backend/dist/standalone/server.js')
    process.exit(1)
} else {
    const app = express();

    app.use(cors());
    app.use(express.json({ limit: '2mb' }));
    app.use(express.urlencoded({ extended: true, limit: '2mb' }));

    app.get('/api', (req, res) => {
        res.json({ message: 'Hello from the backend!' });
    });

    app.listen(resolvedPort, resolvedHostname, () => {
        console.log(`Server is running on http://${resolvedHostname}:${resolvedPort}`);
    });
}
