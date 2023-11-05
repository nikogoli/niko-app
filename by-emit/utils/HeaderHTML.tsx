/** @jsx h */
import { h, Fragment } from "https://esm.sh/preact@10.15.1"
import { type ViewConfig } from "./setHTML.tsx"

export function HeaderHTML(props:{
  script:string,
  viewconfig: ViewConfig,
}){
  const { title, google_fonts, twind_config, css } = props.viewconfig
  const fontlink = (google_fonts)
    ? google_fonts.reduce((txt, f) => txt+`family=${f.replaceAll(" ", "+")}&`, "https://fonts.googleapis.com/css2?") + "display=swap"
    : null

  const twind_config_script = (twind_config && typeof twind_config != "string")
    ? `twind.install(${JSON.stringify(twind_config)})`
    : null

  return(
    <head>
      <meta charSet="utf-8"/>
      <title>{title}</title>
      { (google_fonts && fontlink)
        ? <link href={fontlink} rel="stylesheet"></link>
        : <Fragment></Fragment>
      }
      <script src="https://cdn.twind.style" crossOrigin="true"></script>
      { twind_config_script
        ? <script dangerouslySetInnerHTML={{__html: twind_config_script}}></script>
        : <Fragment></Fragment>
      }
      <script type="module" dangerouslySetInnerHTML={{__html: props.script}}></script>
      <style> {`button:focus { outline-style: none !important}`} </style>
      { css ? <style>{css}</style> : <Fragment></Fragment> }
    </head>
  )
}