const fs = require('fs');
const path = require('path');
const cors = require('cors');
const player = require('sound-play');
const http = require('http');
const express = require('express');
const compression = require('compression');

const soundsPath = path.join(__dirname, '../sounds');

let availableSounds = [];

function getAvailableSounds() {
	const soundsFiles = fs.readdirSync(soundsPath);
	return soundsFiles.map(f => ({ name: path.basename(f, '.mp3'), file: f }));
}

const app = express();

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/css', express.static(path.join(__dirname, '../static/css')));
app.use('/js', express.static(path.join(__dirname, '../static/js')));

app.get('/', (_req, res) => {
	res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/sounds', (_req, res) => {
	res.status(200).json(availableSounds);
});

app.get('/sounds/:name', (req, res) => {
	const name = req.params.name;

	if (!name)
		res.status(404).json({ error: 'Indicame un nombre de sonido en la ruta'});

	if (availableSounds.filter(s => s.name === name.trim()).length === 0)
		res.status(404).json({ error: 'No existe ningún sonido con ese nombre' });

	const sound = availableSounds.filter(s => s.name === name.trim())[0];
	player.play(path.join(soundsPath, sound.file));
	res.status(200).end();
});

app.get('/refresh', (_req, res) => {
	availableSounds = [];
	availableSounds = getAvailableSounds();
	console.log('Recargando sonidos...');
	res.status(200).end();
});

app.all('*', (req, _res, next) => {
	next(new Error(`No existe la dirección ${req.originalUrl} en este servidor!`));
});

http.createServer(app).listen(4080, () => {
	console.log('Servidor iniciado en http://localhost:4080');
	console.log('Listando sonidos');
	availableSounds = getAvailableSounds();
});