讲到vue就离不开vue的双向绑定。所以我也是先从数据响应开始

## 函数定义
在项目中我们可以通过引入`reactive`对数据添加响应式，所以我们从这个方法入手。
首先要找到`reactive`的函数出生地，可以直接全局找，也可以通过引用关系找。
通过全局搜索找到之后，可以通过引用关系来确认。


```
// 首先从vue入口文件开始找 将runtime-dom中的export的方法全部再export出去。
// vue/src/index.js 
export * from '@vue/runtime-dom' 

// 然后从runtime-dom模块找 其中又将runtime-core中的export的方法全部再export出去。
// runtime-dom/src/index.ts 
export * from '@vue/runtime-core'

// 再到runtime-core模块，这里可以看到 reactive 从@vue/reactivity模块来
// runtime-core/src/index.ts
export {
  // core
  computed,
  reactive,
  ref,
  readonly,
  // utilities
  unref,
  proxyRefs,
  isRef,
  toRef,
  toRefs,
  ...
} from '@vue/reactivity'

// 在reactive模块中，继续找。方法定义在reactive.ts
// reactivity/src/index.ts 
export {
  reactive,
  readonly,
  isReactive,
  isReadonly,
  isProxy,
  shallowReactive,
  ...
} from './reactive'

// 最后终于找到函数出生地
// reactivity/src/reactive.ts  
export function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
export function reactive(target: object) {
  // if trying to observe a readonly proxy, return the readonly version.
  if (target && (target as Target)[ReactiveFlags.IS_READONLY]) {
    return target
  }
  console.log('target',target)
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  )
}

```

