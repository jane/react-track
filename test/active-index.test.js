import React from 'react'
import test from 'tape'
import { mount } from 'enzyme'
import Track from '../src/track'

test('activeIndex state', (t) => {
  const ai = ({ startAt, visibleSlides, infinite } = {}) => {
    let goNext, goPrev
    const next = () => goNext()
    const prev = () => goPrev()

    return {
      next,
      prev,
      component: mount(
        <Track
          startAt={startAt}
          visibleSlides={visibleSlides}
          infinite={infinite}
        >
          { (_next, _prev) => {
            goNext = _next
            goPrev = _prev
            return [0, 1, 2, 3, 4, 5, 6, 7]
          }}
        </Track>
      )
    }
  }

  t.equal(
    ai().component.state('activeIndex'),
    0,
    'activeIndex begins at 0 if no startAt is provided'
  )

  t.equal(
    ai({ startAt: 3 }).component.state('activeIndex'),
    3,
    'activeIndex begins at provided startAt index'
  )

  const nexted = ai({ visibleSlides: 3 })
  nexted.next()
  t.equal(
    nexted.component.state('activeIndex'),
    3,
    'activeIndex advances the number of visible slides'
  )

  nexted.next()
  t.equal(
    nexted.component.state('activeIndex'),
    5,
    'activeIndex advances to the end minus visibleSlides when reaching the end'
  )

  const preved = ai({ visibleSlides: 3, startAt: 5 })
  preved.prev()
  t.equal(
    preved.component.state('activeIndex'),
    2,
    'activeIndex retretes the number of visible slides'
  )

  preved.prev()
  t.equal(
    preved.component.state('activeIndex'),
    0,
    'activeIndex should be 0 when reaching the beginning'
  )

  t.end()
})
