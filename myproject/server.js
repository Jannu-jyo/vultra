/**
 * COMMAND: Vultra Backend Proxy 
 * Purpose: Securely handles Replicate API calls and serves the 3D frontend.
 */


requirerequire('dotenv').config();
const express = require('express');
const Replicate = require('replicate');
// ... the rest of your code
// ('dotenv').config();
const express = require('express');
const Replicate = require('replicate');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// COMMAND: Initialize Replicate with your API Token from the .env file
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// COMMAND: Middleware to handle large base64 image strings from the webcam
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.static('public')); // Serves your index.html and main.js

/**
 * COMMAND: Endpoint for 'Draw My Picture'
 * Receives: { image: "data:image/jpeg;base64..." }
 * Returns: { drawingUrl: "https://replicate.delivery/..." }
 */
app.post('/api/draw', async (req, res) => {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: "No image data received." });
        }

        console.log("Vultra is processing the image via Replicate...");

        // COMMAND: Running the AI Model with the efficiency prompt
        const output = await replicate.run(
            "xpira/controlnet-replicate:v1-canny-sdxl", 
            {
                input: {
                    image: image,
                    prompt: "A minimal, expressive line-art sketch portrait, 8k, black and white, dramatic lighting, vector style, white background",
                    condition_scale: 0.8,
                    negative_prompt: "shading, colors, realistic, photo, 3d render, blurry, distorted face",
                    num_inference_steps: 25
                }
            }
        );

        // COMMAND: Send the resulting URL back to the Three.js frontend
        res.json({ drawingUrl: output[0] });

    } catch (err) {
        console.error("Replicate Error:", err.message);
        res.status(500).json({ error: "AI Generation failed", details: err.message });
    }
});

// COMMAND: Start the Vultra server
app.listen(PORT, () => {
    console.log(`Vultra Server is live at http://localhost:${PORT}`);
    console.log(`Ensure your REPLICATE_API_TOKEN is set in the .env file.`);
});