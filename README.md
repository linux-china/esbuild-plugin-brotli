esbuild-brotli-plugin for Node.js
==================================

![npm version](https://img.shields.io/npm/v/esbuild-plugin-brotli)

An esbuild plugin to compress asset files with brotli.

# How to use?

```typescript
import tailwindCss from "./tailwind.css?br"

router.get('/assets/tailwind.css', () => {
    return new Response(tailwindCss, {
        headers: {
            "Content-Type": "text/css",
            "content-encoding": "br"
        }
    })
});
```

# esbuild example

```javascript
const esbuild = require('esbuild');
const brotliPlugin = require('esbuild-plugin-brotli');

esbuild.build({
    bundle: true,
    entryPoints: ['hello.js'],
    plugins: [brotliPlugin],
    write: false
}).then(result => {
    console.log(result.outputFiles[0].text);
}).catch(() => process.exit(1));
```
