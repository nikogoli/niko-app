import { render, createElement, VNode } from "https://esm.sh/preact@10.10.6"

export default function useClosable(props:{
  rootID: string,
  opacity: number,
  innerElem?: VNode,
  position?: {x:number, y:number, corner?:"tl"|"tr"|"bl"|"br"},
  on_settle?: () => void,
}):[
  Set:()=>void, Settle:()=>void,
]{
  const Settle = () => {
    const top_elem = document.getElementById(props.rootID)
    const temp_elem = document.getElementById("temp")
    if (top_elem && temp_elem){
      console.log("delete")
      top_elem.removeChild(temp_elem)
    }
    if (props.on_settle){ props.on_settle() }
  }

  const Set = () => {
    const elem = createElement(
      "div",
      {id: "temp", style: {
        position: "fixed", width: "100%", height: "100%", top: "0", left: "0", zIndex: "10",
      }}
    )
    const top_elem = document.getElementById(props.rootID)!
    const container = document.createElement("div")
    render(elem, container)
    const temp_elem = container.firstElementChild! as HTMLElement
    
    if (props.innerElem){
      temp_elem.style.display = "grid"
      temp_elem.style.placeContent = "center"
      let container = document.createElement("div")
      render(props.innerElem, container)
      const inner_elem = container.firstElementChild! as HTMLElement
      inner_elem.style.zIndex = "15"
      temp_elem.appendChild(inner_elem)
      container = document.createElement("div")
      const backdp = createElement(
        "div", {style: {
          position: "absolute", width: "100%", height: "100%", top: "0", left: "0", zIndex: "11",
          background: `rgba(0, 0, 0, ${props.opacity/100})`
        }}
      )
      render(backdp, container)
      const dp = container.firstElementChild!
      dp.addEventListener("click", Settle)
      temp_elem.appendChild(dp)
      top_elem.appendChild(temp_elem)
      if (props.position){
        temp_elem.style.display = "block"
        const { corner, x, y } = props.position
        const posi_x = corner?.includes("r") ? x -Number(inner_elem.clientWidth) : x
        const posi_y = corner?.includes("b") ? y -Number(inner_elem.clientHeight) : y
        inner_elem.style.left = String(posi_x)
        inner_elem.style.top = String(posi_y)
      }
    } else {
      temp_elem.style.background = `rgba(0, 0, 0, ${props.opacity/100})`
      temp_elem.addEventListener("click", Settle)
      top_elem.appendChild(temp_elem)
    }
    console.log("moutend")
  }
  return [Set, Settle]
}