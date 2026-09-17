import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // VITE_TUNNEL_HOST: host público (p. ej. dev tunnels) desde el que se sirve el
  // dev server. Permite el host y hace que el HMR use wss:443 a través del túnel.
  const env = loadEnv(mode, process.cwd(), '')
  const tunnelHost = env.VITE_TUNNEL_HOST

  return {
    plugins: [react()],
    server: {
      allowedHosts: ['.devtunnels.ms', '.ngrok-free.app', '.ngrok.io', '.loca.lt'],
      ...(tunnelHost
        ? { hmr: { host: tunnelHost, protocol: 'wss', clientPort: 443 } }
        : {}),
    },
  }
})
