const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'dist/online-auctions-admin')));

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/online-auctions-admin', 'index.html'));
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});