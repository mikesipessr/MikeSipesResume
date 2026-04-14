import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin(), cloudflare()],
    server: {
        port: 50893,
    }
})