import tea from "@axel669/teascript/rollup";

export default {
    input: "src/connect.tea",
    output: [
        {
            file: "connect.js",
            format: "cjs"
        },
        {
            file: "browser/connect.js",
            format: "iife",
            name: "NornConnect",
            globals: {
                "react": "React"
            }
        },
        {
            file: "es6/connect.js",
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
