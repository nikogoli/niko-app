import { type ViewConfig } from "./setHTML.tsx"


export function HeaderHTML(props:{
  script: string,
  viewconfig: ViewConfig,
}){
  const { title, google_fonts, twind_config, header_elems } = props.viewconfig
  let fontlink: string|null = null
  if (google_fonts){
    fontlink = google_fonts.reduce((txt, f) => {
      return (typeof f == "string")
        ? txt+`family=${f.replaceAll(" ", "+")}&`
        : txt+`family=${f.name.replaceAll(" ", "+")}:wght@${f.weights.join(";")}&`
    }, "https://fonts.googleapis.com/css2?") + "display=swap"
  }
  
  const twind_config_script = (twind_config && typeof twind_config != "string")
    ? `twind.install(${JSON.stringify(twind_config)})`
    : null
  
  const other_elems = [<></>]
  if (header_elems){
    const { metas, links, styles } = header_elems
    metas?.forEach(attrs => other_elems.push(<meta {...attrs} />))
    links?.forEach(attrs => other_elems.push(<link {...attrs} />))
    styles?.forEach(css => other_elems.push(<style>{css}</style>))
  }

  return(
    <head>
      { header_elems?.metas ?? <meta charSet="utf-8" /> }
      <title>{title}</title>
      { (google_fonts && fontlink)
        ? <link href={fontlink} rel="stylesheet"></link>
        : <></>
      }
      <script src="https://cdn.twind.style" crossOrigin="true"></script>
      { twind_config_script
        ? <script dangerouslySetInnerHTML={{__html: twind_config_script}}></script>
        : <></>
      }
      <script type="module" dangerouslySetInnerHTML={{__html: props.script}}></script>
      <style> {`button:focus { outline-style: none !important}`} </style>
      { other_elems }
    </head>
  )
}