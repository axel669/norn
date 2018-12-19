import tea from "@axel669/teascript/rollup";

export default {
    input: "src/norn.tea",
    output: [
        {
            file: "norn.js",
            format: "cjs"
        },
        {
            file: "browser/norn.js",
            format: "iife",
            name: "Norn"
        }
    ],
    plugins: [
        tea({
            include: "src/**.tea"
        })
    ]
};
