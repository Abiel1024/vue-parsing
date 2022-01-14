## 从reactive入手
首先是对定义的理解，什么是响应式数据。
也就是当数据的值变更之后，对应的使用过这个数据的函数会重新执行。

实现的三个步骤：
1. 用Proxy对数据进行代理，写入set和get
2. 通过暴露的effect对数据进行观测（在这一步会触发get）
3. 修改数据，看到观测的方法被重新执行（响应完成）

## 函数定义
首先要找到`reactive`的函数出生地，可以直接全局找，也可以通过引用关系找。
全局搜索找到之后，也可以通过引用关系来确认。

```typescript
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
  // ...
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
  // ....
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

## 第一步

```typescript
export function reactive(target: object) {
  // if trying to observe a readonly proxy, return the readonly version.
  if (target && (target as Target)[ReactiveFlags.IS_READONLY]) {
    return target
  }
  //
  return createReactiveObject(
    target,  // 数据对象
    false, // 是否只读
    mutableHandlers, // Handlers
    mutableCollectionHandlers, // Handlers
    reactiveMap 
  )
}
```

`reactive`函数比较简单，判断了如果说传入的对象是只读的 就返回对象。因为只读对象就不存在数据变更了。
否则就返回`createReactiveObject`执行结果。

接下来看createReactiveObject
```typescript
function createReactiveObject(
    target: Target,
    isReadonly: boolean,
    baseHandlers: ProxyHandler<any>,
    collectionHandlers: ProxyHandler<any>,
    proxyMap: WeakMap<Target, any>
) {
   // ...
    const proxy = new Proxy(
        target,
        targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
    )
    proxyMap.set(target, proxy)
    return proxy
}
```
总体来看`createReactiveObject` 传入target、isReadonly、handler、和proxyMap，返回Proxy代理对象。

再从头开始看
```typescript
  if (!isObject(target)) {
    if (__DEV__) {
        console.warn(`value cannot be made reactive: ${String(target)}`)
    }
    return target
}
// target is already a Proxy, return it.
// exception: calling readonly() on a reactive object
if (
    target[ReactiveFlags.RAW] &&
    !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
) {
    return target
}
```
这里主要是在开发环境判断，如果target不是一个对象，则会报一个错。如果说对象是本身就是一个Proxy就return对象。

```typescript
  // target already has corresponding Proxy
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
// ... 
proxyMap.set(target, proxy)
return proxy
```
在接下来是用proxyMap进行缓存，proxy是传入的[WeakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/)类型的常量reactiveMap。
所有的reactive都会用这个常量存起来。

```typescript
const targetType = getTargetType(target)
  if (targetType === TargetType.INVALID) {
    return target
  }

  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  )
  proxyMap.set(target, proxy)
  return proxy
```
最后就是判断targetType，然后选择用哪个handler。
```typescript
function getTargetType(value: Target) {
  return value[ReactiveFlags.SKIP] || !Object.isExtensible(value)
    ? TargetType.INVALID
    : targetTypeMap(toRawType(value))
}
function targetTypeMap(rawType: string) {
    switch (rawType) {
        case 'Object':
        case 'Array':
            return TargetType.COMMON
        case 'Map':
        case 'Set':
        case 'WeakMap':
        case 'WeakSet':
            return TargetType.COLLECTION
        default:
            return TargetType.INVALID
    }
}
```
vue内置对象、不可扩展对象： INVALID；
Map、Set、WeakMap、WeakSet： COLLECTION；
Object、Array： COMMON；

这里先讨论通常的对象，其他的情况暂不考虑。所以就是`baseHandlers`。
这个`baseHandlers`是定义在baseHandlers.ts中的常量。
