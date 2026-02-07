import express, { json } from 'express'; // require -> common JS
import { randomUUID } from 'node:crypto';
import cors from 'cors';
import movies from './movies.json' with { type: 'json' };
import { validateMovie, validatePartialMovie } from './schema/movies.js';

const app = express();
app.use(
	cors({
		origin: (origin, callback) => {
			const ACCEPTED_ORIGINS = [
				'http://localhost:8080',
				'http://localhost:3000',
			];

			if (ACCEPTED_ORIGINS.includes(origin)) {
				return callback(null, true);
			}

			if (!origin) {
				return callback(null, true);
			}

			return callback(new Error('not allowed by CORS'));
		},
	}),
);
app.use(json());
app.disable('x-powered-by'); // Deshabilitar el header x-Powered-By: express

// Todos los recursos que sean MOVIES se identifica con /movies
app.get('/movies', (req, res) => {
	const { genre } = req.query;
	if (genre) {
		const filteredMovies = movies.filter((movie) =>
			movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase()),
		);
		return res.json(filteredMovies);
	}
	res.json(movies);
});

app.get('/movies/:id', (req, res) => {
	// path-to-regexp
	const { id } = req.params;
	const movie = movies.find((movie) => movie.id === id);
	if (movie) return res.json(movie);
	res.status(404).json({ message: 'movie not found' });
});

app.post('/movies', (req, res) => {
	const result = validateMovie(req.body);

	if (!result.success) {
		return res.status(400).json({ error: JSON.parse(result.error.message) });
	}

	const newMovie = {
		id: randomUUID(),
		...result.data,
	};

	// esto no seria REST, porque estamos guardando
	// el estado de la aplicacion en memoria
	movies.push(newMovie);

	res.status(201).json(newMovie);
});

app.delete('/movies/:id', (req, res) => {
	const { id } = req.params;
	const movieIndex = movies.findIndex((movie) => movie.id === id);

	if (movieIndex === -1) {
		return res.status(404).json({ message: 'movie not found' });
	}

	movies.splice(movieIndex, 1);

	return res.json({ message: 'movie deleted' });
});

app.patch('/movies/:id', (req, res) => {
	const result = validatePartialMovie(req.body);

	if (!result.success) {
		return res.status(400).json({ error: JSON.parse(result.error.message) });
	}

	const { id } = req.params;
	const movieIndex = movies.findIndex((movie) => movie.id === id);

	if (movieIndex === -1) {
		return res.status(404).json({ message: 'movie not found' });
	}

	const updateMovie = {
		...movies[movieIndex],
		...result.data,
	};

	movies[movieIndex] = updateMovie;

	return res.json(updateMovie);
});

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
	console.log(`servidor escuchando en el puerto http://localhost:${PORT}`);
});
