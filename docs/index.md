# 前言

目的：
* 希望有个具体的目标，能对vue3整个项目有一定的理解。
* 希望产出的这个项目能帮助到在学习vue3源码的同学。

## 准备工作

1. clone[vue-next](https://github.com/vuejs/vue-next.git) 代码到本地
2. 安装pnpm `npm install -g pnpm` vue3使用pnpm进行依赖的管理，所以需要安装pnpm。[了解更多pnpm](https://www.pnpm.cn/npmrc)
3. 运行 `pnpm install` 将项目相关的依赖下载下来，为后续的调试作准备。

## 项目结构
```
.
├── packages------------------------------- 核心目录
│   ├── compiler-core
│   ├── compiler-dom
│   ├── compiler-sfc
│   ├── compiler-ssr
│   ├── reactivity
│   ├── ref-transform
│   ├── runtime-core
│   ├── runtime-dom
│   ├── runtime-test
│   ├── server-renderer
│   ├── sfc-playground
│   ├── shared
│   ├── size-check
│   ├── template-explorer
│   ├── vue
│   ├── vue-compat
│   ├── global.d.ts------------------ 全局类型声明
├── scripts-------------------------------- 打包相关
│   ├── bootstrap.js
│   ├── build.js
│   ├── dev.js
│   ├── filter-e2e.js
│   ├── filter-unit.js
│   ├── preinstall.js
│   ├── release.js
│   ├── setupJestEnv.ts
│   ├── utils.js
│   └── verifyCommit.js
├── test-dts------------------------------- 测试相关
│   ├── ...
├── CHANGELOG.md--------------------------- 更新日志文件
├── README.md------------------------------ readme
├── package.json
├── pnpm-workspace.yaml-------------------- 告诉pnpm代码路径
├── rollup.config.js----------------------- rollup配置
└── tsconfig.json-------------------------- typescript配置

```

接下来我们看到`package.json`中存在`dev`选项，可以本地运行起来。
运行完之后就能看到
```
created packages/vue/dist/vue.global.js in 1.2s
```
也就是说，本地的`vue.js`已经创建完成，在`vue/dist`目录下。

可以通过一个简单的页面来测试一下，可以在`packages`目录下新建一个`test.html`

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<div id="app">
    <input v-model="inputValue" type="text">
    <div>{{ computedMessage }}</div>
    <div>{{ computedMessage }}</div>
</div>
<script src="vue/dist/vue.global.js"></script>
<script>
    Vue.createApp({
        setup() {
            const inputValue = Vue.ref('')
            const computedMessage = Vue.computed(() => inputValue.value + ' is good')
            return {
                inputValue,
                computedMessage
            }
        }
    }).mount('#app')
</script>
</body>
</html>
```

通过直接引入js的方式，接下来就可以在项目中的各个地方进行调试（console/debugger）。

Vue3采用 [monorepo](https://segmentfault.com/a/1190000039157365) 是管理项目代码的方式。在一个 repo 中管理多个package，每个 package 都有自己的类型声明、单元测试。
所以相较vue2来说，vue3的各个模块划分的更加清晰，读起来也更加容易。各个模块之间通过 `@vue/XXX` 进行引用。
