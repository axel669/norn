import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import babel from "@rollup/plugin-babel"

export default {
    input: "src/hooks/useStore.js",
    output: [
        {
            file: "react/index.js",
            format: "cjs"
        },
        {
            file: "esm/react/index.js",
            format: "esm"
        },
        {
            file: "standalone/hooks.js",
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
        "svlete",
    ]
}
