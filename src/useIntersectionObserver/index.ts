import { useState, useCallback, useEffect } from "react"

type NumberList = number[]
type ObserverList = Array<React.RefObject<any>>
type CallbackFunction = (indexList: NumberList) => void
type ResultType = [React.Dispatch<React.SetStateAction<React.RefObject<any>[]>>]

function multiply<T>(list: Array<T>, value: T) {
  const index = list.indexOf(value)
  if (index > -1) {
    list.splice(index, 1)
  }
  return [...list]
}
/**
 * useInScreen
 * @param observerList 由被观察目标所组成的数组，数组项是由React.createRef构建出来的对象
 * @param callback 当目标元素被曝光所需要触发的函数，该函数接受一个参数indexList，由被曝光元素在observerList数组中的索引组成
 * @param delay 延迟delay执行callback函数
 * @param infinite 是否持续观察目标元素，默认值为false。（因为曝光打点一般只需上报一次）
 * @param opt 可以自定义曝光条件（值的构成参考MDN），默认为{ threshold: [1] }，只有当目标元素完全暴露在可视区内才触发回调
 */
let timer: any = null
function UseInScreen(
  observerList: ObserverList,
  callback: CallbackFunction,
  delay: number = 0,
  infinite: boolean = false,
  opt: IntersectionObserverInit = {}
): ResultType {
  // list 为需要监听的元素列表。setList做为useInScreen函数的返回值，可以让调用者修改需要监听的 list
  const [list, setList] = useState<ObserverList>(observerList)
  const [activeList, setActiveList] = useState<NumberList>([])

  /**
   * 为什么单独拉一个newActiveList？
   * 因为每次监听的列表只能是进入既定视区或者出了视区。如果直接setActiveList会导致上一次变化的值给没了～，只有本次变化的值
   * 那为什么不在new IntersectionObserver回调里去操作activeList，使出去的值删掉，进入的值push
   * 因为如果在new IntersectionObserver构造函数中使用ctiveList ，activeList 始终会是空数组
   */
  const [newActiveList, setNewList] = useState<{
    inner: NumberList
    outer: NumberList
  }>({
    inner: [],
    outer: []
  })

  // intersectionObserver： 观察者对象
  let intersectionObserver: IntersectionObserver | null = null

  const observeExposure = useCallback(
    (list: ObserverList) => {
      if (typeof IntersectionObserver === "undefined") {
        return
      }
      if (list.length === 0) return
      // 当观察者存在时销毁该对象
      intersectionObserver && intersectionObserver.disconnect()
      // 构造新的观察者实例
      intersectionObserver = new IntersectionObserver(entries => {
        // 保存本次监听被曝光的元素
        let inner: NumberList = []
        let outer: NumberList = []
        // console.log(newActiveList)

        // 递归每一个本次被监听对象，如果按照曝光条件出现在可视区，则调用callback函数，并且取消监听
        entries.forEach(entrie => {
          // 找出本次被监听对象在list中的索引
          const index = Array.from(list).findIndex(
            item => item.current === entrie.target
          )
          // 防止意外发生
          if (index === -1) return

          // isIntersecting是每个被监听的元素所自带的属性，若为ture，则表示被曝光
          // 并且未被曝光过
          if (entrie.isIntersecting) {
            // 保存本次曝光元素索引
            inner.push(index)
          } else {
            outer.push(index)
          }

          // 解除观察， 若需要无限观察则不取消监听
          !infinite &&
            intersectionObserver &&
            intersectionObserver.unobserve(list[index].current)
        })
        setNewList({ inner, outer })
      }, opt)

      list.forEach(item => {
        item.current &&
          intersectionObserver &&
          intersectionObserver.observe(item.current)

        // 可以兼容直接传入DOM节点。
        // if((<React.RefObject<any>>item).current) {
        //   intersectionObserver.observe((<React.RefObject<any>>item).current)
        // } else if ((<HTMLElement>item)) {
        //   intersectionObserver.observe((<HTMLElement>item))
        // }
      })
    },
    [newActiveList, list]
  )

  useEffect(() => {
    const { inner, outer } = newActiveList
    let list = [...activeList]
    list = list.concat(inner)
    outer.forEach(item => {
      list = multiply(list, item)
    })
    if (inner.length > 0 || outer.length > 0) {
      timer && clearTimeout(timer)
      setActiveList(list)
      timer = setTimeout(() => callback(list), delay)
    }
  }, [newActiveList])

  useEffect(() => {
    observeExposure(list)

    // 当 umount 时取消链接
    return () => {
      intersectionObserver && intersectionObserver.disconnect()
      clearTimeout(timer)
    }
  }, [list])

  return [setList]
}

const useInScreen = UseInScreen

export default useInScreen
