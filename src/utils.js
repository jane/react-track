export const includes = (val, arr) =>
  arr.includes ? arr.includes(val) : !!arr.filter((item) => item === val).length
export const values = Object.values || ((obj) => Object.keys(obj).map((key) => obj[key]))
export const compose = (...fns) => (val) => fns.reduceRight((currVal, fn) => fn(currVal), val)
export const minMap = (...vals) => (val) => Math.min(...vals, val)
export const maxMap = (...vals) => (val) => Math.max(...vals, val)
export const noop = () => {}
export const easeOutQuint = (t) => 1 + (--t) * t ** 4
export const on = (evt, opts = false) => (cb) => (el) => {
  el.addEventListener(evt, cb, opts)
  return () => el.removeEventListener(evt, cb)
}

export const onWindowScroll = (cb) => on('scroll', true)(cb)(window)

export const onScroll = (cb, { target = window } = {}) =>
  onWindowScroll((e) => (target === window || target === e.target) && cb(e))

export const onScrollEnd = (cb, { wait = 100, target = window } = {}) => ((timeoutID) => onScroll((evt) => {
  clearTimeout(timeoutID)
  timeoutID = setTimeout(() => evt.target === target ? cb() : undefined, wait)
}))(0)

export const onScrollStart = (cb, { target = window } = {}) => {
  let started = false
  const offScrollEnd = onScrollEnd(() => { started = false }, { target })
  const offScroll = onScroll((e) => {
    if (!started) {
      started = true
      cb(e)
    }
  }, { target })

  return () => {
    offScroll()
    offScrollEnd()
  }
}

export const onSwipe = (cb) => (target) => {
  const offTouchStart = on('touchstart')(({ targetTouches }) => {
    const { pageX: startX, pageY: startY } = targetTouches[0]
    const offTouchEnd = on('touchend')(({ changedTouches }) => {
      const { pageX: endX, pageY: endY } = changedTouches[0]
      const xDiff = endX - startX
      const absXDiff = Math.abs(xDiff)
      const yDiff = endY - startY
      const absYDiff = Math.abs(yDiff)
      if (Math.max(absXDiff, absYDiff) > 20) {
        const dir = absXDiff > absYDiff ? (/* h */ xDiff < 0 ? 'right' : 'left') : (/* v */ yDiff < 0 ? 'down' : 'up')
        cb(dir)
      }
      offTouchEnd()
    })(target)
  })(target)

  return offTouchStart
}

export const trackTouchesForElement = (el) => {
  let touchIds = []
  on('touchend')(({ targetTouches }) => { touchIds = targetTouches })(el)
  return () => touchIds.length
}

export const trackOngoingMouseInteraction = (el) => {
  let isInteracting = false
  on('mousedown')(() => { isInteracting = true })(el)
  on('mouseup')(() => { isInteracting = false })(document.body)
  return () => isInteracting
}

export const hasOngoingInteraction = (el) => {
  const getOngoingTouchCount = trackTouchesForElement(el)
  const getOngoingMouseClick = trackOngoingMouseInteraction(el)
  return () => getOngoingTouchCount() || getOngoingMouseClick()
}

export const isWhollyInView = (parent) => (child = { getBoundingClientRect: () => ({}) }) => {
  const { left: cLeft, right: cRight } = child.getBoundingClientRect()
  const { left: pLeft, right: pRight } = parent.getBoundingClientRect()
  return (cLeft >= pLeft && cRight <= pRight)
}

export const animate = (el, {
  delta = 0,
  immediate = false,
  duration = 500,
  easing = easeOutQuint,
  prop = 'scrollTop'
} = {}) => (new Promise((res, rej) => {
  if (!delta) return res()
  const initialVal = el[prop]
  if (immediate) {
    el[prop] = initialVal + delta
    return res()
  }
  let hasBailed = false
  const bail = () => {
    hasBailed = true
    const pos = el[prop]
    el.removeEventListener('touchstart', bail)
    el[prop] = pos
    return rej('Animation interupted by interaction')
  }
  el.addEventListener('touchstart', bail)
  let startTime = null
  const step = (timestamp) => {
    if (hasBailed) return
    if (!startTime) startTime = timestamp
    const progressTime = timestamp - startTime
    const progressRatio = easing(progressTime / duration)
    el[prop] = initialVal + (delta * progressRatio)
    if (progressTime < duration) {
      window.requestAnimationFrame(step)
    } else {
      el[prop] = initialVal + delta // jump to end when animation is complete. necessary at least for immediate scroll
      res()
    }
  }
  window.requestAnimationFrame(step)
}))
