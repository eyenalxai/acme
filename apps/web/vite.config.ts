import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { varlockVitePlugin } from "@varlock/vite-integration"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  environments: {
    // The client entry ceiling. The server chunks are not budgeted.
    client: {
      build: {
        chunkSizeWarningLimit: 380,
      },
    },
  },
  plugins: [varlockVitePlugin(), tanstackStart(), viteReact({ compiler: true }), tailwindcss()],
})
