import { h, render } from "https://esm.sh/preact@10.10.6"


export default function useRender (
  vnode: h.JSX.Element,
  onCreated: (arg:Element) => void
) {
  const temp = document.createElement("div")
  render(vnode, temp)
  if (temp.firstElementChild){
    onCreated(temp.firstElementChild)
  } else {
    throw new Error("render(vnode, HTMLDivElement) failed.")
  }
}