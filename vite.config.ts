import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
	root: 'src',
	publicDir: '../public',
	server: {
		port: 8000
	},
	build: {
		outDir: '../dist',
		emptyOutDir: true
	},
	resolve: {
		alias: {
			'~': path.resolve(__dirname, 'src')
		}
	}
})
