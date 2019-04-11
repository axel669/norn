import tea from "@axel669/teascript/rollup";

export default {
    input: "src/norn.tea",
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
            file: "es6/index.js",
            format: "es"
        }
    ],
    plugins: [
        tea({
            include: "src/**.tea"
        })
    ]
};
