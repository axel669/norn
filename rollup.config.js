import resolve from "rollup-plugin-node-resolve"
import babel from "rollup-plugin-babel"

export default {
    input: "src/norn.js",
    output: [
        {
            file: "index.js",
            format: "cjs"
        },
        {
            file: "standalone/norn.js",
            format: "iife",
            name: "Norn"
        },
        {
            file: "esm/index.js",
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
                "@babel/plugin-proposal-nullish-coalescing-operator"
            ]
        }),
        resolve()
    ]
}
