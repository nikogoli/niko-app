/** @jsx h */
import { h } from "https://esm.sh/preact@10.10.6"

export default function SimpleSpinner(props:{
  size?: number,
  main_color?: string,
  bg_color?: string,
}){
  const size = props.size ? `h-${props.size} w-${props.size}` : "h-10 w-10"
  const main = "border-" + (props.main_color ? props.main_color : "sky-400")
  const bg = props.bg_color ? props.bg_color : "inherit"
  return (
    <div class="flex justify-center">
      <div class={`animate-spin ${size} border-4 ${main} rounded-full`}
            style={{"border-top-color": bg}}></div>
    </div>
  )
}