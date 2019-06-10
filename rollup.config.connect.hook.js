import babel from "rollup-plugin-babel"

export default {
    input: "src/connect.hook.js",
    output: [
        {
            file: "connect/hook/index.js",
            format: "cjs"
        },
        {
            file: "standalone/connect/hook.js",
            format: "iife",
            name: "NornConnect.Hook",
            globals: {
                "react": "React"
            }
        },
        {
            file: "esm/connect/hook/index.js",
            format: "esm"
        }
    ],
    external: ["react"],
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
        })
    ]
}
