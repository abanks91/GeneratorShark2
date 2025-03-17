import rateLimit from "express-rate-limit";

// ✅ Apply Rate Limiting (5 requests per minute per IP)
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Max 5 requests per minute per IP
    message: "Too many requests. Please try again later.",
});

// ✅ Memory cache for API responses
const responseCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export default async function handler(req, res) {
    // Apply rate limiting
    try {
        await limiter(req, res);
    } catch (error) {
        return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Hide API Key in Environment Variables

        if (!OPENAI_API_KEY) {
            return res.status(500).json({ error: "API key not configured" });
        }

        const { query } = req.body;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: "Valid query parameter is required" });
        }

        // Sanitize the query to prevent injection
        const sanitizedQuery = query.trim().slice(0, 100);
        
        // Check cache first
        const cacheKey = `ai_rec_${sanitizedQuery.toLowerCase()}`;
        if (responseCache.has(cacheKey)) {
            const cachedResponse = responseCache.get(cacheKey);
            if (Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
                console.log(`Using cached recommendations for: ${sanitizedQuery}`);
                return res.status(200).json(cachedResponse.data);
            } else {
                // Cache expired, remove it
                responseCache.delete(cacheKey);
            }
        }

        // ✅ Using GPT-4o for smarter recommendations
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that suggests related search terms for a stock media gallery. Provide diverse, creative and visually interesting alternatives."
                    },
                    {
                        role: "user",
                        content: `Suggest 5 alternative search terms related to: "${sanitizedQuery}". Respond with only the terms separated by commas, no numbering or explanation.`
                    }
                ],
                max_tokens: 100,
                temperature: 0.7 // Add some creativity to recommendations
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("OpenAI API Error:", errorData);
            return res.status(response.status).json({
                error: "Error from OpenAI API",
                details: errorData
            });
        }

        const data = await response.json();

        // ✅ Extract and format search terms
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const terms = data.choices[0].message.content
                .split(',')
                .map(term => term.trim())
                .filter(term => term.length > 0 && term.length <= 50); // Reasonable length limit

            const responseData = { terms };
            
            // Store in cache
            responseCache.set(cacheKey, {
                data: responseData,
                timestamp: Date.now()
            });

            return res.status(200).json(responseData);
        }

        return res.status(200).json({ terms: [] });

    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
}