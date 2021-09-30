const esbuild = require('esbuild');

const brotliPlugin = require('../index');

esbuild.build({
    bundle: true,
    entryPoints: ['hello.js'],
    plugins: [brotliPlugin],
    write: false
}).then(result => {
    console.log(result.outputFiles[0].text);
}).catch(() => process.exit(1));
