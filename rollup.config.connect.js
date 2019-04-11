import tea from "@axel669/teascript/rollup";

export default {
    input: "src/connect.tea",
    output: [
        {
            file: "connect/index.js",
            format: "cjs"
        },
        {
            file: "standalone/connect.js",
            format: "iife",
            name: "NornConnect",
            globals: {
                "react": "React"
            }
        },
        {
            file: "es6/connect/index.js",
            format: "es"
        }
    ],
    external: ["react"],
    plugins: [
        tea({
            include: "src/**.tea"
        })
    ]
};
