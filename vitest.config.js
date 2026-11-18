import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env:{
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: "15min",
      CORS_ORIGIN: "http://localhost:5173"
    }
  },
})