import tea from "@axel669/teascript/rollup";

export default {
    input: "src/connect-hook.tea",
    output: [
        {
            file: "connect-hook/index.js",
            format: "cjs"
        },
        {
            file: "standalone/connect-hook.js",
            format: "iife",
            name: "NornConnectHook",
            globals: {
                "react": "React"
            }
        },
        {
            file: "es6/connect-hook/index.js",
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
