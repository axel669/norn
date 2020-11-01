import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import babel from "@rollup/plugin-babel"

export default {
    input: "src/svelte/state.js",
    output: [
        {
            file: "svelte/index.js",
            format: "cjs"
        },
        {
            file: "esm/svelte/index.js",
            format: "esm"
        },
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
