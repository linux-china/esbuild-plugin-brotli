const {compress} = require('brotli-wasm');
const fs = require('fs');
const {resolve} = require('path');
const upath = require('upath');
const FileHound = require('filehound');

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
    const originalPath = resolve(resolveDir, path.replace("?br", ""));
    let stats = fs.lstatSync(originalPath);
    if (stats.isFile()) {// compress one file
        const rawBuffer = await fs.promises.readFile(originalPath);
        const compressedBytes = compress(new Uint8Array(rawBuffer));
        return {contents: compressedBytes, loader: "binary"};
    } else if (stats.isDirectory()) { // compress all files in directory
        const compressedFiles = [];
        const files = await FileHound.create().paths(originalPath)
            .discard(/node_modules/)
            .ignoreHiddenFiles()
            .ignoreHiddenDirectories()
            .find();
        const originalPathUnix = upath.toUnix(originalPath);
        const offset = originalPathUnix.endsWith("/") ? originalPathUnix.length - 1 : originalPathUnix.length
        for (const file of files) {
            const relativeFilePath = upath.toUnix(file).substring(offset);
            const rawBuffer = await fs.promises.readFile(file);
            const compressedBytes = compress(new Uint8Array(rawBuffer));
            const base64Text = Buffer.from(compressedBytes).toString("base64");
            compressedFiles.push(`"${relativeFilePath}": __toBinary2('${base64Text}')`);
        }
        const binaryFunction = `const __toBinary2=(()=>{for(var r=new Uint8Array(128),a=0;a<64;a++)r[a<26?a+65:a<52?a+71:a<62?a-4:4*a-205]=a;return a=>{for(var t=a.length,e=new Uint8Array(3*(t-("="==a[t-1])-("="==a[t-2]))/4|0),n=0,o=0;n<t;){var A=r[a.charCodeAt(n++)],h=r[a.charCodeAt(n++)],c=r[a.charCodeAt(n++)],d=r[a.charCodeAt(n++)];e[o++]=A<<2|h>>4,e[o++]=h<<4|c>>2,e[o++]=c<<6|d}return e}})();`;
        return {contents: binaryFunction + ` export default { ${compressedFiles.join(",")} } `};
    } else {
        throw  new Error("brotli plugin: please import file or path!");
    }
}

module.exports = {name, setup};
