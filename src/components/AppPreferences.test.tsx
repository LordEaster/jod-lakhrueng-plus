import { describe, expect, it, afterEach } from 'vitest'
import { applyAppPreferences } from './AppPreferences'

describe('applyAppPreferences', () => {
  afterEach(() => {
    delete document.documentElement.dataset.fontSize
    delete document.documentElement.dataset.reduceMotion
  })

  it('applies font size mode and reduce motion to the document root', () => {
    applyAppPreferences({
      fontSizeMode: 'extra-large',
      reduceMotion: true,
    })

    expect(document.documentElement.dataset.fontSize).toBe('extra-large')
    expect(document.documentElement.dataset.reduceMotion).toBe('true')
  })
})
