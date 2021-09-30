const {compress} = require('brotli-wasm');
const fs = require('fs');

const name = 'brotli'

const setup = ({onResolve, onLoad}) => {
    onResolve({filter: /.*\?br$/}, ({path, resolveDir}) => ({
        path: path,
        namespace: 'brotli-ns',
        pluginData: {resolveDir}
    }));
    onLoad({filter: /.*/, namespace: 'brotli-ns'}, brotliCompress);
}

const brotliCompress = async ({path, pluginData}) => {
    const resolveDir = pluginData.resolveDir;
    const originalPath = resolveDir + "/" + path.replace("?br", "");
    const rawBuffer = await fs.promises.readFile(originalPath);
    const compressedBytes = compress(new Uint8Array(rawBuffer));
    return {contents: compressedBytes, loader: "binary"};
}

module.exports = {name, setup};
