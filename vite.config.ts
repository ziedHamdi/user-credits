import {defineConfig} from 'vite'
import {resolve} from 'path'
import dtsPlugin from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        dtsPlugin({
            insertTypesEntry: true,
        }),
    ],
    build: {
        target:'es2020',
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['es']
        }
    },
    resolve: {
        alias: {
            src: resolve('src/')
        }
    },
})