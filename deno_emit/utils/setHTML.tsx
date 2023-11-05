/** @jsx h */
import { renderToString } from "https://esm.sh/preact-render-to-string@5.2.2?deps=preact@10.10.6"
import { h, JSX, Fragment } from "https://esm.sh/preact@10.15.1"
import { toFileUrl, resolve } from "https://deno.land/std@0.200.0/path/mod.ts"
import { bundle } from "https://deno.land/x/emit@0.31.0/mod.ts"

import { HeaderHTML } from "./HeaderHTML.tsx"
import TwindConfig from "./twind.config.ts"


export type ViewConfig = {
  title: string,
  size: [number, number],
  crient_path: string,
  twind_config?: string | Record<string, unknown>,
  google_fonts?: Array<string>,
  css?: string,
  use_worker: boolean,
  port: number,
}


export type SetViewProps = {
  config: ViewConfig,
  route: string,
  save_file: boolean,
  props_setter?: () => Record<string, unknown> | Promise<Record<string, unknown>>,
  import_map_url?: string,
}


type RouteMod = {
  default: (props:Record<string, unknown>) => JSX.Element,
  PropsSetter?: ( () => Record<string, unknown>) | ( () => Promise<Record<string, unknown>>)
}


async function route_files_to_dict(){
  const dict: Record<string, string> = {}
  for await (const fl of Deno.readDir("./routes")){
    if (fl.name.endsWith(".tsx") || fl.name.endsWith(".jsx")){
      dict[fl.name] = `./routes/${fl.name}`
    }
  }
  return dict
}


export async function setHTML(props: SetViewProps){
  const { crient_path, google_fonts } = config
  const { config, import_map_url } = props

  // ------ Set Twind config ----------
  if (config.twind_config === undefined){
    config.twind_config = TwindConfig as Record<string, unknown>
  }
  else if (typeof config.twind_config === "string"){
    await import(toFileUrl(resolve(config.twind_config)).href)
      .then((mod: {default:Record<string, unknown>}) => config.twind_config = mod.default)
  }

  // ------ Get route files ----------
  let Name2Path_dict: Record<string, string>
  if (Deno.env.get("RoutesDict")){
    Name2Path_dict = JSON.parse(Deno.env.get("RoutesDict")!) as Record<string, string>
  } else {
    Name2Path_dict = await route_files_to_dict()
    Deno.env.set("RoutesDict", JSON.stringify(Name2Path_dict))
  }

  const raw_name = props.route.split(".")[0]
  const mod_name = raw_name.charAt(0).toUpperCase() + raw_name.slice(1)

  const path = Name2Path_dict[props.route]
  const MOD = await import(toFileUrl(resolve(`./${path}`)).href) as RouteMod

  const comp_props = (props.props_setter)
      ? await props.props_setter()
      : (MOD.PropsSetter) ? await MOD.PropsSetter()
      : null

  const CLIENT_TS =`
    /** @jsx h */
    import { h, hydrate } from "https://esm.sh/preact@10.10.6"
    import { default as ${mod_name} } from "./${path}"
    hydrate( <${mod_name} ${comp_props ? `{...${JSON.stringify(comp_props)}}` : ""} />, document.body )
  `
  
  await Deno.writeTextFile(crient_path, CLIENT_TS)

  const script = await bundle(
    crient_path,
    {
      allowRemote: true,
      importMap: import_map_url,
      compilerOptions:{jsxFactory:"preact.h"}
    }
  ).then(result => result.code)

  await Deno.remove(crient_path)

  const ActiveComp = MOD.default

  function View(){
    const props = comp_props ? comp_props : {}
    return(
      <html>
        <HeaderHTML script={script} viewconfig={config}/>
        <body>
          <ActiveComp {...props}/>
          { (google_fonts)
            ? <style> {`body { font-family: \'${google_fonts[0]}\'}`} </style>
            : <Fragment></Fragment>
          }
        </body>
      </html>
    )
  }


  const html = renderToString(View())
  if (props.save_file){
    const tempFilePath = await Deno.makeTempFile({suffix: ".html"})
    await Deno.writeTextFile(tempFilePath, html)
    return { file_path: tempFilePath, html}
  } else {
    return { file_path: "", html }
  }
}