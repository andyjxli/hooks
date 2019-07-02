## 使用

```javascript
import Card from "components/goods-card/goods-card"
import { connect } from "react-redux"
import { getSinglePromotionList } from "../../page_components/promotion/redux/creator"
import React, { useEffect, useState, useCallback } from "react"
import useIntersectionObserver from "page_components/promotion/useIntersectionObserver"

const List = (props: { info: any, getData: any }) => {
  const { info, getData } = props

  // 被监听元素的列表
  const [refList, setRefList] = useState < React.RefObject < any > [] > []

  const callback = useCallback((indexList: number[]) => {
    console.log(indexList)
  }, [])

  // 调用
  const [setList] = useIntersectionObserver(refList, callback)

  // 当refList发生改变时，调用我们的Hook返回的方法以更新需要监听的元素
  useEffect(() => {
    setList(refList)
  }, [refList])

  // 当数据发生改变时，重新生成RefList
  useEffect(() => {
    const list: React.RefObject<any>[] = info.list.map(() => React.createRef())
    setRefList(list)
  }, [info])

  // 发送请求，获取商品数据
  useEffect(() => {
    getData()
  }, [])

  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      {info.list.map((item: any, index: number) => (
        <div ref={refList[index]} key={index}>
          <Card card={item} />
        </div>
      ))}
    </div>
  )
}

const mapStateToProps = (state: any) => {
  return {
    info: state.promotionStore.singlePromotionInfo,
    userInfo: state.userInfo
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    getData: () => dispatch(getSinglePromotionList(params, silence))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List)
```

## 解决问题

1. 解决监听曝光元素的痛点，不再需要监听 scroll。从而造成性能开销

## 使用场景

1. 曝光埋点

## 参数说明

| 参数         | 类型                            | 说明                                                                                                         | 必须 | 默认值             |
| ------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---- | ------------------ |
| observerList | Array<React.RefObject<any>>     | 由被观察目标所组成的数组，数组项是由 React.createRef 构建出来的对象                                          | 是   |                    |
| callback     | (indexList: NumberList) => void | 当目标元素被曝光所需要触发的函数，该函数接受一个参数 indexList，由被曝光元素在 observerList 数组中的索引组成 | 是   |
| delay        | number                          | 延迟 delay 秒执行                                                                                            | 否   | 0                  |
| infinite     | boolean                         | 是否持续观察目标元素                                                                                         | 否   | false              |
| opt          | IntersectionObserverInit        | 可以自定义曝光条件（值的构成参考 MDN）                                                                       | 否   | { threshold: [1] } |

## 返回值说明（返回的是数组，可以解构赋值）

| 返回值  | 类型                                                           | 说明                                                                               |
| ------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| setList | [React.Dispatch<React.SetStateAction<React.RefObject<any>[]>>] | setList 做为 UseIntersectionObserver 函数的返回值，可以让调用者修改需要监听的 list |
