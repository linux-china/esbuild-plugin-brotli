const {compress} = require('brotli-wasm');
const {readFileSync} = require('fs');

const name = 'brotli'

const setup = ({onResolve, onLoad}) => {
    onResolve({filter: /.*\?br$/}, ({path}) => ({
        path: path,
        namespace: 'brotli-ns'
    }));
    onLoad({filter: /.*/, namespace: 'brotli-ns'}, brotliCompress);
}

const brotliCompress = async ({path}) => {
    const originalPath = path.replace("?br", "");
    const rawBuffer = readFileSync(originalPath);
    const compressedBytes = compress(new Uint8Array(rawBuffer));
    return {contents: compressedBytes, loader: "binary"};
}

module.exports = {name, setup};
