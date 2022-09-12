export type FiberSource = {
  fileName: string
  lineNumber: number
  columnNumber: number
}

export type Fiber = {
  return: Fiber | null
  child: Fiber | null
  sibling: Fiber | null
  stateNode: Node | null
  index: number
  tag: number
  memoizedProps?: { [key: string]: unknown }
  _debugSource?: FiberSource
  _debugOwner?: Fiber
  elementType: string | Function | ElementTypeProvider
}

export type ElementTypeProvider = {
  $$typeof: Symbol
  _context: {
    Consumer: unknown
    Provider: unknown
  }
  render?: Function & {
    displayName?: string
  }
}

export function getReactFiber(element: Node) {
  const key = Object.keys(element).find((key) => {
    return key.startsWith('__reactFiber$')
  })

  if (!key) {
    return null
  }

  const domFiber = (element[key as keyof typeof element] ??
    null) as Fiber | null

  return domFiber
}

export function nodeIsComponentRoot(node: Node): node is HTMLElement {
  const fiber = getReactFiber(node)

  if (!fiber?._debugOwner || !fiber?.return) {
    return false
  }

  return node instanceof HTMLElement && fiber.return === fiber._debugOwner
}

export function nodeGetReactRoot(node: Node) {
  const element = node instanceof Element ? node : node.parentElement
  if (!element) {
    return null
  }

  const fiber = getReactFiber(element)
  if (!fiber) {
    return null
  }

  let result = fiber
  while (result._debugOwner) {
    result = result._debugOwner
  }

  return result
}

export const fiberTags = {
  fragment: 7,
}

function* fiberGetSiblingsGenerator(fiber: Fiber) {
  let sibling = fiber?.return?.child
  while (sibling) {
    yield sibling
    sibling = sibling.sibling
  }
}

export function fiberGetSiblings(fiber: Fiber) {
  return [...fiberGetSiblingsGenerator(fiber)]
}

export function elementGetOwnerWithSource(element: Node) {
  const fiber = getReactFiber(element)

  let currentFiber: Fiber | null = fiber
  while (currentFiber) {
    const ownerSource = currentFiber._debugOwner?._debugSource
    if (ownerSource) {
      return currentFiber._debugOwner ?? null
    }
    currentFiber = currentFiber._debugOwner ?? null
  }

  return null
}
