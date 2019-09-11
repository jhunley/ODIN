import L from 'leaflet'
import uuid from 'uuid-random'

export const backdropClipping = (group, _) => {
  const backdrops = []

  const reset = () => {
    backdrops.forEach(element => group.removeChild(element))
    backdrops.length = 0
  }

  const withLabel = (element, tx, ty) => {
    const box = L.SVG.inflate(element.getBBox(), 4)
    const backdrop = L.SVG.rect({
      x: box.x + tx,
      y: box.y + ty,
      width: box.width,
      height: box.height,
      stroke: 'black',
      'stroke-width': 1,
      fill: 'white'
    })

    backdrops.push(backdrop)
    group.insertBefore(backdrop, element)
  }

  return {
    reset,
    withLabel,
    withPath: () => {},
    finish: () => {}
  }
}

export const maskClipping = (group, defs) => {
  const id = uuid()
  const clip = L.SVG.mask({ id: `mask-${id}` })
  const whiteMask = L.SVG.rect({ fill: 'white' })
  const blackMasks = []

  defs.appendChild(clip)
  clip.appendChild(whiteMask)

  const reset = () => {
    // Clear-out masks and labels:
    blackMasks.forEach(mask => clip.removeChild(mask))
    blackMasks.length = 0
  }

  const withLabel = (element, tx, ty) => {
    // Determin label region which should be clipped from path (black mask):
    const maskBox = L.SVG.inflate(element.getBBox(), 8)
    const blackMask = L.SVG.rect({
      x: maskBox.x + tx,
      y: maskBox.y + ty,
      width: maskBox.width,
      height: maskBox.height
    })

    blackMasks.push(blackMask)
    clip.appendChild(blackMask)
  }

  const withPath = element => {
    element.setAttribute('mask', `url(#mask-${id})`)
  }

  const finish = () => {
    // Update white mask (necessary for proper clipping):
    const nox = group.getBBox()
    L.SVG.setAttributes(whiteMask)({ ...L.SVG.inflate(nox, 20) })
  }

  return {
    reset,
    withLabel,
    withPath,
    finish
  }
}
