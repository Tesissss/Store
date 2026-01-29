const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8006;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else {
        res.status(404).send('Archivo index.html no encontrado');
    }
});

app.get('/main/products', (req, res) => {
    try {
        const jsonPath = path.join(__dirname, 'main.json');
        
        if (!fs.existsSync(jsonPath)) {
            return res.status(200).json({
                music: [],
                products: []
            });
        }
        
        const data = fs.readFileSync(jsonPath, 'utf8');
        const jsonData = JSON.parse(data);
        
        res.json({
            music: jsonData.music || [],
            products: jsonData.products || []
        });
        
    } catch (error) {
        console.error('Error al leer main.json:', error);
        res.status(500).json({
            music: [],
            products: [],
            error: "Error interno del servidor"
        });
    }
});

app.get('/styles.css', (req, res) => {
    const cssPath = path.join(__dirname, 'styles.css');
    if (fs.existsSync(cssPath)) {
        res.sendFile(cssPath);
    } else {
        res.status(404).send('Archivo CSS no encontrado');
    }
});

app.get('/script.js', (req, res) => {
    const jsPath = path.join(__dirname, 'script.js');
    if (fs.existsSync(jsPath)) {
        res.sendFile(jsPath);
    } else {
        res.status(404).send('Archivo JavaScript no encontrado');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
