## 使用

```javascript
import { useFetch } from '@msfe/react-hooks'
import { post } from 'common/utils/http'

const getList = (params: EffectListParams) =>
  post('/network/api/dye/effect/list', params)

const Demo = () => {
  const effectParams: EffectListParams = { type: 1 }
  const [effect, fetchEffect, loading, setError] = useFetch(
    getList,
    effectParams,
    { total: 0, list: [] },
    true
  )

  ...
}
```

## 解决问题

1. 解决每次发送请求都需要 try/catch 的重复性操作。同时有些同学不习惯写 try/catch，这样就能在不写的同时保证安全
2. 解决大部分场景都需要加锁，以防止用户重复性操作导致重复请求的问题。在不实用此 hook 之前都是添加手动添加 loading 来加锁
3. 暴露了 loading，让开发者不再需要关注 loading 的状态，能够直接获取 loading
4. 第三个参数可以传入 null 或不传模拟请求错误

## 使用场景

1. React 函数式组件
2. 大多数发送请求场景，但是需要注意由于加锁导致请求不能多次发送。所以某些场景需要重复发送请求的暂不能使用

## 支持范型

```javascript
useFetch<R, P>(...)
```

-R: 请求返回值类型
-P: 请求参数类型

## 参数说明

| 参数        | 类型      | 说明                 | 必须 | 默认值    |
| ----------- | --------- | -------------------- | ---- | --------- |
| getFunction | Function  | 发送请求的函数       | 是   |           |
| params      | P（见上） | 是                   | 是   |
| initValues  | R（见上） | 初始化返回值         | 否   | undefined |
| execute     | boolean   | 是否立即执行请求函数 | 否   | true      |

## 返回值说明（返回的是数组，可以解构赋值）

| 返回值   | 类型                              | 说明                   |
| -------- | --------------------------------- | ---------------------- |
| res      | R（见上）                         | 请求返回值             |
| loading  | boolean                           | 是否在请求中           |
| fetch    | (params?: Partial<P>) => void     | 调用以支持再次发送请求 |
| setError | (fn?: (err: any) => void) => void | 请求发送失败回掉函数   |
