## pnpm-workspace
Vue3采用 [monorepo](https://segmentfault.com/a/1190000039157365) 是管理项目代码的方式。在一个 repo 中管理多个package，每个 package 都有自己的类型声明、单元测试。
所以相较vue2来说，vue3的各个模块划分的更加清晰，读起来也更加容易。

通过`pnpm-workspace.yaml` 将包模块代码放置在了packages的文件夹下。
