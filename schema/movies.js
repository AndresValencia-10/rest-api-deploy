const z = require('zod');
const movieSchema = z.object({
	title: z.string({
		invalid_type_error: 'movie title must be a string',
		required_error: 'movie title is required',
	}),
	year: z.number().int().min(1900).max(2026),
	director: z.string(),
	duration: z.number().int().positive(),
	rate: z.number().min(0).max(10).default(0),
	poster: z.string().url({
		message: 'poster must be a valid URL',
	}),
	genre: z.array(
		z.enum([
			'Action',
			'Comedy',
			'Drama',
			'Horror',
			'Romance',
			'Crime',
			'Sci-Fi',
			'Documentary',
		]),
		{
			required_error: 'genre is required',
			invalid_type_error: 'genre must be an array of enum Genre',
		},
	),
});

function validateMovie(object) {
	return movieSchema.safeParse(object);
}

function validatePartialMovie(object) {
	return movieSchema.partial().safeParse(object);
}

module.exports = {
	validateMovie,
	validatePartialMovie,
};
