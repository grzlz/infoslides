import { json } from '@sveltejs/kit';
import { ContentPipeline } from '$lib/services/ContentPipeline.js';
import { Topic } from '$lib/models/instagram/Topic.js';

/**
 * API endpoint for testing AI dialogue generation
 * POST /test-ai with topic data in body
 */
export async function POST({ request }) {
	try {
		const body = await request.json();

		// Create or use provided topic
		let topic;
		if (body.topic) {
			topic = Topic.fromJSON(body.topic);
		} else {
			// Create sample topic if none provided
			topic = new Topic();
			topic.title = body.title || 'Why Learn Go?';
			topic.description =
				body.description ||
				'Explore why Go is becoming the language of choice for modern backend development';
			topic.category = body.category || 'intro';
			topic.difficulty = body.difficulty || 'beginner';
			topic.keywords = body.keywords || ['go', 'golang', 'programming', 'backend'];
			topic.addLearningObjective('Understand Go\'s key benefits');
			topic.addLearningObjective('Learn when to use Go vs other languages');
			topic.scheduleForDay(1);
		}

		// Generate content
		const pipeline = ContentPipeline.fromEnv();
		const result = await pipeline.generateDialogueContent({
			topic,
			reviewMode: true
		});

		return json({
			success: true,
			data: result,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('[test-ai] Generation error:', error);

		return json(
			{
				success: false,
				error: error.message,
				stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
			},
			{ status: 500 }
		);
	}
}

/**
 * GET endpoint with sample topics for testing
 */
export async function GET() {
	const sampleTopics = [
		{
			title: 'Why Learn Go?',
			description: 'Discover why Go is the perfect language for modern backend development',
			category: 'intro',
			difficulty: 'beginner',
			keywords: ['go', 'golang', 'introduction', 'backend']
		},
		{
			title: 'Goroutines Explained',
			description: 'Learn how Go\'s lightweight concurrency model works',
			category: 'concurrency',
			difficulty: 'intermediate',
			keywords: ['goroutines', 'concurrency', 'go', 'async']
		},
		{
			title: 'Channels in Go',
			description: 'Master Go\'s channel-based communication between goroutines',
			category: 'concurrency',
			difficulty: 'intermediate',
			keywords: ['channels', 'goroutines', 'concurrency', 'go']
		},
		{
			title: 'Error Handling in Go',
			description: 'Understand Go\'s explicit error handling philosophy',
			category: 'basics',
			difficulty: 'beginner',
			keywords: ['errors', 'error handling', 'go', 'best practices']
		},
		{
			title: 'Go vs JavaScript',
			description: 'Compare Go and JavaScript for backend development',
			category: 'comparison',
			difficulty: 'intermediate',
			keywords: ['go', 'javascript', 'node', 'comparison', 'backend']
		}
	];

	return json({
		success: true,
		sampleTopics,
		message: 'Use POST /test-ai with one of these topics to generate dialogue'
	});
}
