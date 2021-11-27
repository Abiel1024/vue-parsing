# 前言

目的：
* 希望有个具体的目标，能对vue3整个项目有一定的理解。
* 希望产出的这个项目能帮助到在学习vue3源码的同学。

## 准备工作

1. clone[vue-next](https://github.com/vuejs/vue-next.git) 代码到本地
2. 安装pnpm `npm install -g pnpm` vue3使用pnpm进行依赖的管理，所以需要安装pnpm。[了解更多pnpm](https://www.pnpm.cn/npmrc)
3. 运行 `pnpm install` 将项目相关的依赖下载下来，为后续的调试作准备。

## 项目结构
先大致的看待
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