import { h, render } from "https://esm.sh/preact@10.10.6"

type OnRemoveFunc = (elem:Element, ...args:Array<unknown>)=>void

export default function usePooup (
  rootID: string,
  vnode: h.JSX.Element,
  duration: number | "manual",
  onCreated?: (arg:Element) => void,
): (onRemove?:OnRemoveFunc, wait?:number, ...args:Array<unknown>)=>void {
  const root = document.getElementById(rootID)!
  const temp = document.createElement("div")
  render(vnode, temp)
  if (temp.firstElementChild){
    const popup_elem = temp.firstElementChild
    if (onCreated){ onCreated(popup_elem) }
    root.appendChild(popup_elem)
    const remover = (onRemove?:OnRemoveFunc, wait?:number, ...inputs:Array<unknown>) => {
      if (onRemove){
        onRemove(popup_elem, ...inputs)
        setTimeout( () => root.removeChild(popup_elem), wait ?? 300 )
      } else {
        root.removeChild(popup_elem)
      }
    }
    if ( typeof duration == "number"){
      setTimeout( remover, duration )
    }
    return remover
  } else {
    throw new Error("render(vnode, HTMLDivElement) failed.")
  }
}