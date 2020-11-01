import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import babel from "@rollup/plugin-babel"

export default {
    input: "src/norn.js",
    output: [
        {
            file: "index.js",
            format: "cjs"
        },
        {
            file: "esm/index.js",
            format: "esm"
        },
        {
            file: "standalone/norn.js",
            format: "iife",
            name: "norn",
            globals: {
                "react": "React",
            },
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
