## package.json
那么通过run dev如何打包出`vue/dist/vue.global.js`呢？
先看`package.json`
``` json
{
  "private": true,
  "version": "3.2.23",
  "scripts": {
    "dev": "node scripts/dev.js",
    "build": "node scripts/build.js",
    "size": "run-s size-global size-baseline",
    "size-global": "node scripts/build.js vue runtime-dom -f global -p",
    "size-baseline": "node scripts/build.js runtime-dom runtime-core reactivity shared -f esm-bundler && cd packages/size-check && vite build",
    ...
  },
  ...
}
```

## scripts/dev.js
`npm run dev` 执行的是`scripts/dev.js`，没有传任何的环境变量。接下来就是打开对应的`scripts/dev.js`。
``` javascript
const execa = require('execa')
const { fuzzyMatchTarget } = require('./utils')
const args = require('minimist')(process.argv.slice(2))
const target = args._.length ? fuzzyMatchTarget(args._)[0] : 'vue'
const formats = args.formats || args.f
const sourceMap = args.sourcemap || args.s
const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7)

execa(
  'rollup',
  [
    '-wc',
    '--environment',
    [
      `COMMIT:${commit}`,
      `TARGET:${target}`,
      `FORMATS:${formats || 'global'}`,
      sourceMap ? `SOURCE_MAP:true` : ``
    ]
      .filter(Boolean)
      .join(',')
  ],
  {
    stdio: 'inherit'
  }
)
```
因为我们在执行`run dev`的时候没有传任何的参数，所以这里的`args`的值是这样的 `{_: []}`。
所以下面的值就很清晰了
``` javascript
const { fuzzyMatchTarget } = require('./utils')
const args = require('minimist')(process.argv.slice(2))  // {_: []}
const target = args._.length ? fuzzyMatchTarget(args._)[0] : 'vue'    // 'vue'
const formats = args.formats || args.f  // undefined
const sourceMap = args.sourcemap || args.s  // undefined
const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7) // 这是动态获取git最近一次commit生成的8位随机码

```

所以最终的执行内容是这样的
``` javascript
execa(
  'rollup',
  [
    '-wc',
    '--environment',
    [
      `COMMIT:2d4f4554`,
      `TARGET:vue`,
      `FORMATS:'global',
      ``
    ]
      .filter(Boolean)
      .join(',')
  ],
  {
    stdio: 'inherit'
  }
)
```

## rollup.config.js
接下来就要看`rollup.config.js`了，

``` javascript
// 当没有TARGET时会报错，通过上面的配置，run dev 传入的是 vue
if (!process.env.TARGET) {
  throw new Error('TARGET package must be specified via --environment flag.')
}

// 这里都是为了获取静态数据, 可以单独开一个终端，将这些代码在终端里执行。会更加直观
const masterVersion = require('./package.json').version   //package.json中的version 
const packagesDir = path.resolve(__dirname, 'packages')   // packages路径：/vue-next/packages
const packageDir = path.resolve(packagesDir, process.env.TARGET)  // /vue-next/packages/vue
// resolve 方法基于path.resolve封装，只是固定第一个变量为packageDir，后续就不用关心当前目录是哪一个。简单的封装，很实用。
const resolve = p => path.resolve(packageDir, p)
const pkg = require(resolve(`package.json`))  // 获取到目标目录（vue）的package.json
const packageOptions = pkg.buildOptions || {}  // vue目录下的package.json
const name = packageOptions.filename || path.basename(packageDir) // vue

let hasTSChecked = false

const outputConfigs = {
 // 定义了不同命令的输出
}

const defaultFormats = ['esm-bundler', 'cjs']
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',')  // ['vue']
const packageFormats = inlineFormats || packageOptions.formats || defaultFormats // ['vue']
const packageConfigs = process.env.PROD_ONLY // 这里的环境变量也会是false，packageConfigs得到的是后面的结果。
  ? []
  // 这里传入的输出文件已经是上面配置过的静态变量
  : packageFormats.map(format => createConfig(format, outputConfigs[format]))

if (process.e nv.N ODE_ENV === 'production') { // 正式打包会执行，暂时不管。
}
// 最终返回 packageConfigs 
export default packageConfigs 

function createConfig(format, output, plugins = []) {}
function createReplacePlugin() {}
function createProductionConfig(format) {}
function createMinifiedConfig(format) {}
```

看下来，其实中还是执行 `createConfig`，得到最终的`packageConfigs`

忽略createConfig中的external、plugin，我们可以精简下 createConfig
```javascript
function createConfig(format, output, plugins = []) {
  if (!output) { // 当没有输出的时候报错
    console.log(require('chalk').yellow(`invalid format: "${format}"`))
    process.exit(1)
  }
  const isGlobalBuild = /global/.test(format)
  const isCompatPackage = pkg.name === '@vue/compat'
  // 添加输出内容
  output.exports = isCompatPackage ? 'auto' : 'named'
  output.sourcemap = !!process.env.SOURCE_MAP
  output.externalLiveBindings = false

  if (isGlobalBuild) {
     output.name = packageOptions.name
  }
  
  let entryFile = /runtime$/.test(format) ? `src/runtime.ts` : `src/index.ts`
  return {
    input: resolve(entryFile), // 获取到
    output
  }
}
```

看完，就能了解到`run dev`，最终传递给rollup的配置是这样的
```javascript
return {
    input: '/vue-next/packages/vue/src/index.ts', // 获取到
    output: {
        file: '/vue-next/packages/vue/dist/vue.global.js',
        format: `iife`,
        name: 'vue',
        exports: 'named',
        sourcemap: false,
        externalLiveBindings: false
    },
}
```

这样对如何构建本地`vue.global.js`的就有了一个大概的了解，真正的打包当然不是这么简单。
因为我们的目标还是vue设计思路的理解，所以打包就不深入了。