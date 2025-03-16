export interface Env {
	AI: Ai;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// Handle preflight requests for CORS
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		const url = new URL(request.url);
		const baseTheme = url.searchParams.get('name') || 'mystical warrior';

		// SFW and varied  woman prompts
		const variations = [
			` woman in a ${baseTheme} outfit, smiling.`,
			`Stylish  woman with a ${baseTheme} theme.`,
			`Cute  woman dressed in ${baseTheme} style.`,
			`Elegant  woman in a ${baseTheme} dress.`,
			` woman with ${baseTheme} vibes, posing.`,
			`Chill  woman wearing ${baseTheme}-inspired clothes.`,
			`Trendy  woman with a ${baseTheme} look.`,
			`Fantasy  woman with a ${baseTheme} touch.`,
			` woman with ${baseTheme} aesthetic, standing confidently.`,
			`Cool  woman rocking a ${baseTheme} outfit.`,
			`Casual  woman with a ${baseTheme} feel.`,
			`Mysterious  woman with ${baseTheme} details.`,
			`Sci-fi  woman with ${baseTheme} accessories.`,
			` woman in a dreamy ${baseTheme} setting.`,
			`Sporty  woman with a ${baseTheme} twist.`,
			`Charming  woman inspired by ${baseTheme}.`,
			`Cozy  woman in a ${baseTheme} hoodie.`,
			`Daring  woman in a ${baseTheme} uniform.`,
			`Elegant  woman in a ${baseTheme} kimono.`,
			`Edgy  woman with ${baseTheme} attitude.`,
			`Cheerful  woman in a ${baseTheme} festival outfit.`,
			`Magical  woman with a ${baseTheme} wand.`,
			`Street-style  woman in ${baseTheme} fashion.`,
			`Classy  woman in a ${baseTheme} gown.`,
			`Laid-back  woman with ${baseTheme} accessories.`,
		];

		// Retry logic
		const maxRetries = 3;
		let attempt = 0;
		let response;
		let success = false;

		while (attempt < maxRetries && !success) {
			const randomPrompt = variations[Math.floor(Math.random() * variations.length)];

			try {
				response = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
					prompt: randomPrompt
				});

				// Check if response is valid and not blocked (assuming a block returns `null` or an error)
				if (response && response.image) {
					success = true;
				} else {
					attempt++;
				}
			} catch (error) {
				console.error(`AI request failed on attempt ${attempt + 1}:`, error);
				attempt++;
			}
		}

		// If all retries fail, return an error message instead of an image
		if (!success) {
			return new Response(JSON.stringify({ error: 'Failed to generate an image after multiple attempts.' }), {
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				},
				status: 500
			});
		}

		const dataURI = `data:image/jpeg;charset=utf-8;base64,${response?.image}`;

		return new Response(JSON.stringify({ dataURI }), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			},
		});
	},
} satisfies ExportedHandler<Env>;
