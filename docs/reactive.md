## 从reactive入手
首先是对定义的理解，什么是响应式数据。
也就是当数据的值变更之后，对应的使用过这个数据的函数会重新执行。

实现的三个步骤：
1. 用Proxy对数据进行代理，写入set和get
2. 通过暴露的effect对数据进行观测（在这一步会触发get，订阅数据）
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

## 1.生成Proxy对象

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

这里先讨论通常的对象，其他的情况暂不考虑，所以就是`baseHandlers`。
再看`baseHandlers`，它是定义在baseHandlers.ts中的常量。

在baseHandlers中， 把`set`和`get`部分抽出来。
```typescript
// ...
const get = /*#__PURE__*/ createGetter()
// ...
function createGetter(isReadonly = false, shallow = false) {
    return function get(target: Target, key: string | symbol, receiver: object) {
        // ...
    }
}
// ...
const set = /*#__PURE__*/ createSetter()
// ...
function createSetter(shallow = false) {
    return function set(
        target: object,
        key: string | symbol,
        value: unknown,
        receiver: object
    ): boolean {
    }
}
// ...
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys
}
```
可以看到，`mutableHandlers`的get和set就是createGetter和createSetter返回的函数。
接下来分别来看下，但是注意一点，这个函数并不会执行，是在值读取和写入的时候才会执行。

### get
```typescript
function createGetter(isReadonly = false, shallow = false) {
    return function get(target: Target, key: string | symbol, receiver: object) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        } else if (
            key === ReactiveFlags.RAW &&
            receiver ===
            (isReadonly
                    ? shallow
                        ? shallowReadonlyMap
                        : readonlyMap
                    : shallow
                        ? shallowReactiveMap
                        : reactiveMap
            ).get(target)
        ) {
            return target
        }

        const targetIsArray = isArray(target)

        if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
            return Reflect.get(arrayInstrumentations, key, receiver)
        }

        const res = Reflect.get(target, key, receiver)

        if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
            return res
        }

        if (!isReadonly) {
            track(target, TrackOpTypes.GET, key)
        }

        if (shallow) {
            return res
        }

        if (isRef(res)) {
            // ref unwrapping - does not apply for Array + integer key.
            const shouldUnwrap = !targetIsArray || !isIntegerKey(key)
            return shouldUnwrap ? res.value : res
        }

        if (isObject(res)) {
            // Convert returned value into a proxy as well. we do the isObject check
            // here to avoid invalid value warning. Also need to lazy access readonly
            // and reactive here to avoid circular dependency.
            return isReadonly ? readonly(res) : reactive(res)
        }

        return res
    }
}
```
先看参数，因为在调用的时候没传参数，所以`isReadonly`和`shallow`都是false。

接下来是判断key的类型
```typescript
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        } else if (
            key === ReactiveFlags.RAW &&
            receiver ===
            (isReadonly
                    ? shallow
                        ? shallowReadonlyMap
                        : readonlyMap
                    : shallow
                        ? shallowReactiveMap
                        : reactiveMap
            ).get(target)
        ) {
            return target
        }
```
这里的判断是vue内置的一些属性，也可以不关注，所以先跳过。
```typescript
    const targetIsArray = isArray(target)

    if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver)
    }
```
这里是对数组的一个分支。如果说，观测的对象是一个数组的逻辑。暂时先放着，我们先分析对象。
```typescript
    const res = Reflect.get(target, key, receiver)

    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res
    }

    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key)
    }
```
这里获取到值，然后判断了是否是Symbol类型及内置的三个类型。
builtInSymbols，是将Symbol内置的几个属性为Symbol的值的Map,当时这些值的时候，进行数据观测就会失效。
例如key值是: `Symbol['matchAll']`、`Symbol['replace']`等。为什么呢？这里有点坑，先留着晚点再说。

内置的三个类型是：`__proto__`,`__v_isRef`,`__isVue`，就不解释了。

**标记一下，这里是重点了，如果`isReadonly`是false，就调用`track`函数。**
```typescript
if (shallow) {
      return res
    }

    if (isRef(res)) {
      // ref unwrapping - does not apply for Array + integer key.
      const shouldUnwrap = !targetIsArray || !isIntegerKey(key)
      return shouldUnwrap ? res.value : res
    }

    if (isObject(res)) {
      // Convert returned value into a proxy as well. we do the isObject check
      // here to avoid invalid value warning. Also need to lazy access readonly
      // and reactive here to avoid circular dependency.
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
```
在接下来res进行处理，最终将res返回。
* `shallow`是false，所以不会执行。
* `isRef(res)`判断如果内容是ref的，则要返回.value的值
* `isObject(res)`则判断了，如果是对象，要进行**递归代理**。

所以最最最重要还是在于这一行
```typescript
track(target, TrackOpTypes.GET, key)
```
但是track里的函数会涉及到一些`effect`的前置条件，所以这一步知道get时会调用就行。

### set
```typescript
function createSetter(shallow = false) {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    let oldValue = (target as any)[key]
    if (!shallow && !isReadonly(value)) {
      value = toRaw(value)
      oldValue = toRaw(oldValue)
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        oldValue.value = value
        return true
      }
    } else {
      // in shallow mode, objects are set as-is regardless of reactive or not
    }

    const hadKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key)
    const result = Reflect.set(target, key, value, receiver)
    // don't trigger if target is something up in the prototype chain of original
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, TriggerOpTypes.ADD, key, value)
      } else if (hasChanged(value, oldValue)) {
        trigger(target, TriggerOpTypes.SET, key, value, oldValue)
      }
    }
    return result
  }
}
```
先看参数，因为调用的时候没有传参，所以`shallow`为`false`。 在接下来看返回的函数。
```typescript
    let oldValue = (target as any)[key]
    if (!shallow && !isReadonly(value)) {
      value = toRaw(value)
      oldValue = toRaw(oldValue)
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        oldValue.value = value
        return true
      }
    } else {
      // in shallow mode, objects are set as-is regardless of reactive or not
    }
```
这里先获取了oldValue，通过isReadonly方法判断了是否存在内置的`__v_isReadonly`属性。
我们这边进入到if里，在对value和oldValue都进行了toRaw处理。
toRaw这个方法定义在reactive中，用户递归获取对象的`__v_raw`属性。
```typescript
export function toRaw<T>(observed: T): T {
  const raw = observed && (observed as Target)[ReactiveFlags.RAW]
  return raw ? toRaw(raw) : observed
}
```
然后判断了，如果target不是数组、oldValue是ref并且新的值不是ref，就把值修改了，然后return。
为什么呢？可以直接return？因为ref本身是响应式的， 这里就不重复触发了。

所以再往下看
```typescript
   const hadKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key)
    const result = Reflect.set(target, key, value, receiver)
```
对于set的情况，分两种。原来有值和没值的。如果说原来有值，没有值，需要新增属性。
两个逻辑是不一样的，所以先判断了下。如果说是数组，要先判断下key值是否为数字并且数字小于数组的长度。

```typescript
const result = Reflect.set(target, key, value, receiver)
// don't trigger if target is something up in the prototype chain of original
if (target === toRaw(receiver)) {
    if (!hadKey) {
        trigger(target, TriggerOpTypes.ADD, key, value)
    } else if (hasChanged(value, oldValue)) {
        trigger(target, TriggerOpTypes.SET, key, value, oldValue)
    }
}
return result
```
这里通过Reflect.set对值进行了修改，同时获取到result，最后进行return。
所以最重要的逻辑就是在中间的`trigger`里了。
中间首先判断了`target`和`toRaw(receiver)`是否一致。
`receiver`可能会不清楚他的定义，可以看下[阮一峰的es6入门](https://es6.ruanyifeng.com/#docs/proxy) 
当属性存在于原型链上时，target和receiver就不一致了。这时不需要触发响应。

**在接下来判断了`hadeKey`，但是两者都调用了`trigger`方法，很显然`trigger`方法是重点。**
两者传参有些不一致，这里也会设计到一些前置条件。所以只要知道set的时候会调用trigger方法即可。

----
**总结：生成的proxy对象写入了set和get。**
* 触发get时会调用  track(target, TrackOpTypes.GET, key)
* 触发set时会调用  trigger(target, TriggerOpTypes.SET, key, value, oldValue)

## 2.effect数据订阅


## 3.触发响应

