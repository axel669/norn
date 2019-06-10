import babel from "rollup-plugin-babel"

export default {
    input: "src/connect.class.js",
    output: [
        {
            file: "connect/class/index.js",
            format: "cjs"
        },
        {
            file: "standalone/connect/class.js",
            format: "iife",
            name: "NornConnect.Class",
            globals: {
                "react": "React"
            }
        },
        {
            file: "esm/connect/class/index.js",
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
                "@babel/plugin-proposal-class-properties",
                "@babel/plugin-proposal-optional-chaining",
                "@babel/plugin-proposal-nullish-coalescing-operator"
            ]
        })
    ]
}
