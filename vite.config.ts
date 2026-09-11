import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

// Plugin to cleanly handle and suppress Vite dev-server WebSocket HMR rejections
// in sandboxed container and reverse-proxy iframe environments
function suppressHmrWebSocketPlugin(): Plugin {
  return {
    name: 'suppress-hmr-websocket',
    apply: 'serve',
    transform(code, id) {
      if (id.includes('vite/dist/client/client.mjs') || id.includes('@vite/client')) {
        return code
          .replace(
            /reject\(new Error\([^)]*WebSocket closed without opened[^)]*\)\);?/g,
            'resolve();'
          )
          .replace('throw e;', '/* suppressed hmr error */')
          .replace(
            'transport.connect(createHMRHandler(handleMessage));',
            'transport.connect(createHMRHandler(handleMessage)).catch(() => {});'
          )
          .replaceAll(
            'console.error(`[vite] failed to connect to websocket',
            'console.debug(`[vite] failed to connect to websocket'
          );
      }
      return null;
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), suppressHmrWebSocketPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
