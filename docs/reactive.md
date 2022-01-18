## 从reactive入手

首先是对定义的理解，什么是响应式数据。 也就是当数据的值变更之后，对应的使用过这个数据的函数会重新执行。

实现的三个步骤：

1. 用Proxy对数据进行代理，写入set和get
2. 通过暴露的effect对数据进行观测（在这一步会触发get，订阅数据）
3. 修改数据，看到观测的方法被重新执行（响应完成）

## 函数定义

首先要找到`reactive`的函数出生地，在`reactivity/src/reactive.ts`中。

```typescript
// reactivity/src/reactive.ts  
export function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
export function reactive(target: object) {
    // if trying to observe a readonly proxy, return the readonly version.
    if (target && (target as Target)[ReactiveFlags.IS_READONLY]) {
        return target
    }
    console.log('target', target)
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

`reactive`函数比较简单，判断了如果说传入的对象是只读的 就返回对象。因为只读对象就不存在数据变更了。 否则就返回`createReactiveObject`执行结果。

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

vue内置对象、不可扩展对象： INVALID； Map、Set、WeakMap、WeakSet： COLLECTION； Object、Array： COMMON；

这里先讨论通常的对象，其他的情况暂不考虑，所以就是`baseHandlers`。 再看`baseHandlers`，它是定义在baseHandlers.ts中的常量。

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

可以看到，`mutableHandlers`的get和set就是createGetter和createSetter返回的函数。 接下来分别来看下，但是注意一点，这个函数并不会执行，是在值读取和写入的时候才会执行。

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

这里获取到值，然后判断了是否是Symbol类型及内置的三个类型。 builtInSymbols，是将Symbol内置的几个属性为Symbol的值的Map,当时这些值的时候，进行数据观测就会失效。
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

这里先获取了oldValue，通过isReadonly方法判断了是否存在内置的`__v_isReadonly`属性。 我们这边进入到if里，在对value和oldValue都进行了toRaw处理。
toRaw这个方法定义在reactive中，用户递归获取对象的`__v_raw`属性。

```typescript
export function toRaw<T>(observed: T): T {
    const raw = observed && (observed as Target)[ReactiveFlags.RAW]
    return raw ? toRaw(raw) : observed
}
```

然后判断了，如果target不是数组、oldValue是ref并且新的值不是ref，就把值修改了，然后return。 为什么呢？可以直接return？因为ref本身是响应式的， 这里就不重复触发了。

所以再往下看

```typescript
   const hadKey =
    isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key)
const result = Reflect.set(target, key, value, receiver)
```

对于set的情况，分两种。原来有值和没值的。如果说原来有值，没有值，需要新增属性。 两个逻辑是不一样的，所以先判断了下。如果说是数组，要先判断下key值是否为数字并且数字小于数组的长度。

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

这里通过Reflect.set对值进行了修改，同时获取到result，最后进行return。 所以最重要的逻辑就是在中间的`trigger`里了。 中间首先判断了`target`和`toRaw(receiver)`是否一致。
`receiver`可能会不清楚他的定义，可以看下[阮一峰的es6入门](https://es6.ruanyifeng.com/#docs/proxy)
当属性存在于原型链上时，target和receiver就不一致了。这时不需要触发响应。

**在接下来判断了`hadeKey`，但是两者都调用了`trigger`方法，很显然`trigger`方法是重点。**
两者传参有些不一致，这里也会设计到一些前置条件。所以只要知道set的时候会调用trigger方法即可。

----

### 结论

生成的proxy对象写入了set和get

* 触发get时会调用 track(target, TrackOpTypes.GET, key)
* 触发set时会调用 trigger(target, TriggerOpTypes.SET, key, value, oldValue)

## 2.effect数据订阅

我们通过vue暴露的effect来实现动态响应，所以先看下一个例子。

```typescript
const {effect} = Vue
const state = reactive({
    count: 123,
})
const countChange = () => {
    console.log(`count is changed！count: ${state.count}`)
}
effect(countChange)
setInterval(() => {
    state.count++
}, 2000)
```

通过如上代码，可以实现在控制台隔两秒打印一次count值。 通过第一步，我们分析了reactive函数做了什么， 这一步，我们要看下effect方法做了什么。

先找到`effect`函数，它定义在`/packages/reactivity/src/effects.ts`中

```typescript
export function effect<T = any>(
    fn: () => T,
    options?: ReactiveEffectOptions
): ReactiveEffectRunner {
    if ((fn as ReactiveEffectRunner).effect) {
        fn = (fn as ReactiveEffectRunner).effect.fn
    }

    const _effect = new ReactiveEffect(fn)
    if (options) {
        extend(_effect, options)
        if (options.scope) recordEffectScope(_effect, options.scope)
    }
    if (!options || !options.lazy) {
        _effect.run()
    }
    const runner = _effect.run.bind(_effect) as ReactiveEffectRunner
    runner.effect = _effect
    return runner
}
```

effect支持传入两个参数，方法+配置。 先看第一部分

```typescript
  if ((fn as ReactiveEffectRunner).effect) {
    fn = (fn as ReactiveEffectRunner).effect.fn
}
```

在我们是使用过程中，传入的的是一个方法。所以不会进入到if语句。不过可以猜测，这里最终都是为了获取最终响应式的方法。

### ReactiveEffect对象

接下来是生成一个`ReactiveEffect`对象，传入的是动态响应的函数`fn`。

```typescript
  const _effect = new ReactiveEffect(fn)
```

先看下ReactiveEffect

````typescript
export class ReactiveEffect<T = any> {
    active = true
    deps: Dep[] = []

    // can be attached after creation
    computed?: boolean
    allowRecurse?: boolean
    onStop?: () => void
    // dev only
    onTrack?: (event: DebuggerEvent) => void
    // dev only
    onTrigger?: (event: DebuggerEvent) => void

    constructor(
        public fn: () => T,
        public scheduler: EffectScheduler | null = null,
        scope?: EffectScope | null
    ) {
        recordEffectScope(this, scope)
    }

    run() {
        // ...
    }

    stop() {
        if (this.active) {
            cleanupEffect(this)
            if (this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}
````

`ReactiveEffect`类定义了`run`和`stop`两个方法，以及重要的参数：`active`、`deps`、`fn`。 在创建实例的时候执行了`recordEffectScope(this, scope)`
，通过名字就可以知道，用于记录effect的作用域，所以也可以先不关心。

在继续看effect函数

```typescript
  if (options) {
    extend(_effect, options)
    if (options.scope) recordEffectScope(_effect, options.scope)
}
if (!options || !options.lazy) {
    _effect.run()
}
```

根据我们的例子，传入的options是null，所以这里第一个if判断会跳过，进入到第二个判断，执行刚生成的实例的run方法。

```typescript
if (!this.active) {
    return this.fn()
}
```

首先是判断了active值， active值是用于当前响应式是否可用。可以通过stop方法将其置为false，置为false之后不可逆。 这里的值默认是true，所以不会进入到if语句中。

再往下

```typescript
if (!effectStack.includes(this)) {
    try {
        effectStack.push((activeEffect = this))
        // ...
        // return this.fn()
    } finally {
        // ...
        effectStack.pop()
        // ...
    }
}
```

先看下effectStack，他是定义在顶部的一个变量。是一个存effect的栈。他try中push进栈，然后在finally中出栈。 按照现有的逻辑，effectStack是不会包含当前this的。这里有待深究，看下是为了处理哪种情况。

这里的`try`和`finally`组成一对。在`this.fn()`执行之前，把前置条件准备好，在函数执行之后在把对应的条件清楚掉。 用try和finally，即使fn函数执行报错，也不会影响环境的内容。所以这里的代码要前后对照着看。

```typescript
effectStack.push((activeEffect = this))

const n = effectStack.length
activeEffect = n > 0 ? effectStack[n - 1] : undefined
```

`effectStack.push((activeEffect = this))`不仅往数组里push了一个值，还将activeEffect设置为this。
所以当执行完，就将其设置为effectStack的最后一项。先进先出的思路，所以命名上也是叫stack。 这里可能会有疑问，一进一出，effectStack的长度最大应该是1才对？这里其实没有考虑fn里面如果再写一个effect的情况。

```typescript
effect(() => {
    effect(() => {

    })
})
```

在接下来是 `enableTracking()` 和 `resetTracking()` 这一对维护了 shouldTrack的值，在Proxy对象的get的track函数中会用到。

在往下：

```typescript
try {
    // ...
    trackOpBit = 1 << ++effectTrackDepth

    if (effectTrackDepth <= maxMarkerBits) {
        initDepMarkers(this)
    } else {
        cleanupEffect(this)
    }
    // ...
} finally {
    if (effectTrackDepth <= maxMarkerBits) {
        finalizeDepMarkers(this)
    }

    trackOpBit = 1 << --effectTrackDepth
    // ...
}
```

这里维护了两个值：`effectTrackDepth`，effect递归的层级每加一级就会+1，`trackOpBit`是根据effectTrackDepth做了位运算。
然后判断effectTrackDepth和maxMarkerBits。maxMarkerBits值是固定的30，也就是如果超过30，就会把所有的响应式清除。

所以剩下的`initDepMarkers(this)`和`finalizeDepMarkers(this)`组成一对，目的是先将原有的依赖标记，然后在无效依赖进行删除。
这里会设计到位运算、依赖值收集和变更，现在看还有些复杂，在具体设置的时候在继续讨论.

最后就剩执行`return this.fn()`

在执行this.fn时，当前作用于的两个重要变量值再过一遍：

* activeEffect： 根据fn生成的ReactiveEffect实例。
* shouldTrack： true

### track

在执行this.fn()时，会触发响应式数据的getter，而在生成proxy对象中，触发getter会执行track函数。

```typescript

track(target, TrackOpTypes.GET, key) // 回顾createGetter方法中调用track

export function track(target: object, type: TrackOpTypes, key: unknown) {
    if (!isTracking()) {
        return
    }
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
        depsMap.set(key, (dep = createDep()))
    }

    const eventInfo = __DEV__
        ? {effect: activeEffect, target, type, key}
        : undefined

    trackEffects(dep, eventInfo)
}
```

先看第一部分

```typescript
if (!isTracking()) {
    return
}

export function isTracking() {
    return shouldTrack && activeEffect !== undefined
}
```

首先对当前的shouldTrack和activeEffect做了判断。因为我们前面分析过了这两个值，所说这里不会被return，会继续往下走。

```typescript
let depsMap = targetMap.get(target)
if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
}
let dep = depsMap.get(key)
if (!dep) {
    depsMap.set(key, (dep = createDep()))
}
```

这两段很相似, 用一个二维的Map来存对应的dep。第一个维度是target，第二个维度是key，每次获取前先从map里读，读不到就设置进去。
最终dep是createDep的返回结果
```typescript
export const createDep = (effects?: ReactiveEffect[]): Dep => {
  const dep = new Set<ReactiveEffect>(effects) as Dep
  dep.w = 0
  dep.n = 0
  return dep
}
```
可以看到dep是一个Set的实例，但是多了`w`和`n`两个属性，这两个属性初始值都是0。

再继续往下看
```typescript
  const eventInfo = __DEV__
    ? {effect: activeEffect, target, type, key}
    : undefined

trackEffects(dep, eventInfo)
```

再接下来调用`trackEffects`方法，传入dep和eventInfo。其中eventInfo只在开发环境下有值，对流程不影响，也可以不管。

```typescript
export function trackEffects(
    dep: Dep,
    debuggerEventExtraInfo?: DebuggerEventExtraInfo
) {
    let shouldTrack = false
    if (effectTrackDepth <= maxMarkerBits) {
        if (!newTracked(dep)) {
            dep.n |= trackOpBit // set newly tracked
            shouldTrack = !wasTracked(dep)
        }
    } else {
        // Full cleanup mode.
        shouldTrack = !dep.has(activeEffect!)
    }

    if (shouldTrack) {
        dep.add(activeEffect!)
        activeEffect!.deps.push(dep)
        if (__DEV__ && activeEffect!.onTrack) {
            activeEffect!.onTrack(
                Object.assign(
                    {
                        effect: activeEffect!
                    },
                    debuggerEventExtraInfo
                )
            )
        }
    }
}
```

传入参数就是dep，接下来看代码

```typescript
  let shouldTrack = false
if (effectTrackDepth <= maxMarkerBits) {
    if (!newTracked(dep)) {
        dep.n |= trackOpBit // set newly tracked
        shouldTrack = !wasTracked(dep)
    }
} else {
    // Full cleanup mode.
    shouldTrack = !dep.has(activeEffect!)
}
```

首先是在当前函数作用于声明一个`shouldTrack`变量，然后判断effectTrackDepth和maxMarkerBits的关系，这个逻辑上面解释过了。
```typescript
export const wasTracked = (dep: Dep): boolean => (dep.w & trackOpBit) > 0
export const newTracked = (dep: Dep): boolean => (dep.n & trackOpBit) > 0
```
因为`dep.n`和`dep.w` 是 0， 所以位运算`&`之后都为0，所以`!newTracked(dep)`和`!wasTracked(dep)`都会true。
这里的`&`运算，是只有两者都为1的情况，结果才是以1。

再来说下这个语法
```typescript
dep.n |= trackOpBit  //等同于 dep.n = dep.n | trackOpBit
```
因为`shouldTrack`是`true`，所以再往下进入到判断中
```typescript
if (shouldTrack) {
    dep.add(activeEffect!)
    activeEffect!.deps.push(dep)
    if (__DEV__ && activeEffect!.onTrack) {
        activeEffect!.onTrack(
            Object.assign(
                {
                    effect: activeEffect!
                },
                debuggerEventExtraInfo
            )
        )
    }
}
```
首先是当前的dep里push当前的实例对象，也就是fn函数生成的`reactiveEffect`。
然是在reactiveEffect中push当前dep。
下面的是开发环境的调试模块，也可以先不关心。


## 3.触发响应

