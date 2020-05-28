import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import babel from "@rollup/plugin-babel"

export default {
    input: "src/hooks/useStore.js",
    output: [
        {
            file: "hooks/index.js",
            format: "cjs"
        },
        {
            file: "standalone/hooks.js",
            format: "iife",
            name: "norn.useStore",
            globals: {
                "react": "React",
            },
        },
        {
            file: "esm/hooks/index.js",
            format: "esm"
        }
    ],
    plugins: [
        babel({
            exclude: "node_modules/**",
            include: "src/**/*.js",
            babelrc: false,
            plugins: [
                "@babel/plugin-transform-react-jsx",
                "@babel/plugin-proposal-optional-chaining",
                "@babel/plugin-proposal-nullish-coalescing-operator",
            ]
        }),
        resolve(),
        commonjs(),
    ],
    external: [
        "react",
    ]
}
