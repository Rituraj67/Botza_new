import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    const env = loadEnv(mode, process.cwd(), '');

    // Extract just the origin (e.g. "http://localhost:5051") from the full base URL
    const helpdeskBaseUrl = env.VITE_HELPDESK_API_BASE || 'http://localhost:5050/api/v1/public';
    let helpdeskTarget = 'http://localhost:5050';
    try {
        const urlObj = new URL(helpdeskBaseUrl);
        helpdeskTarget = urlObj.origin; // e.g. "http://localhost:5051"
    } catch (e) {
        // fallback if malformed
    }

    return {
        plugins: [react()],
        server: {
            port: 5173,
            proxy: {
                // Botza Express backend
                '/api': {
                    target: 'http://localhost:3001',
                    changeOrigin: true,
                },
                // Botza Public Help Center API — proxy dynamically routes to the correct port
                '/public-api': {
                    target: helpdeskTarget,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/public-api/, '/api/v1/public'),
                },
            },
        },
    };
});

