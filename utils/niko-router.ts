import { STATUS_CODE, STATUS_TEXT,} from "jsr:@std/http@1.0.16/status"
import { contentType } from "jsr:@std/media-types@1.1.0"
import { blue, green, red, yellow, cyan, magenta } from "jsr:@std/fmt@1.0.7/colors"
import { filterValues } from "jsr:@std/collections@1.1.0"

export { blue, green, red, yellow, cyan, magenta }

export type Handler = (
    req: Request,
    params: URLPatternComponentResult["groups"] | undefined,
    info: Deno.ServeHandlerInfo,
  ) => Response | Promise<Response>

export interface Routes {
  [path: string]: Handler
}


let routes: Routes = { 404: defaultNotFoundPage }




function defaultNotFoundPage() {
  return new Response("<h1 align=center>page not found</h1>", {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}


/** serve() registers "fetch" event listener and invokes the provided route
 * handler for the route with the request as first argument and processed path
 * params as the second.
 *
 * @example
 * ```ts
 * serve({
 *  "/": (request: Request) => new Response("Hello World!"),
 *  404: (request: Request) => new Response("not found")
 * })
 * ```
 *
 * The route handler declared for `404` will be used to serve all
 * requests that do not have a route handler declared.
 */
export function serve(
  userRoutes: Routes,
  options: Deno.ServeTcpOptions = { port: 8000 },
): void {
  routes = { ...routes, ...userRoutes }
  Deno.serve(options, (req, info) => handleRequest(req, routes, info))
}


async function handleRequest(
  request: Request,
  routes: Routes,
  info: Deno.ServeHandlerInfo,
): Promise<Response> {
  const { search, pathname } = new URL(request.url)
  try {
    const startTime = Date.now();
    let response: Response | undefined = undefined
    if (typeof response === "undefined") {
      for (const route of Object.keys(routes)) {
        const [pathname, search] = route.split("?")
        const pattern = new URLPattern({ pathname, search })
        if (pattern.test(request.url)) {
          const params = filterValues({
            ...pattern.exec(request.url)!.pathname.groups,
            ...pattern.exec(request.url)!.search.groups,
            }, val => val != ""
          )
          try {
            response = await routes[route](request, params, info);
          } catch (error: any) {
            if (error.name == "NotFound") {
              break;
            }
            console.error("Error serving request:", error);
            response = json({ error: error.message }, { status: 500 });
          }
          break;
        }
      }
    }

    // return not found page if no handler is found.
    if (response === undefined) {
      response = await routes["404"](request, {}, info);
    }

    // method path+params timeTaken status
    console.log(
      `[${yellow(request.method)}] ${green(pathname + search)} ${
        response.headers.has("x-function-cache-hit")
          ? String.fromCodePoint(0x26a1)
          : ""
      }${Date.now() - startTime}ms ${
        response.status != 404 ? blue(String(response.status)) : red(String(response.status))}`,
    );

    return response;
  } catch (error: any) {
    console.error("Error serving request:", error);
    return json({ error: error.message }, { status: 500 });
  }
}


/** Converts an object literal to a JSON string and returns
 * a Response with `application/json` as the `content-type`.
 *
 * @example
 * ```js
 * import { serve, json } from "https://deno.land/x/sift/mod.ts"
 *
 * serve({
 *  "/": () => json({ message: "hello world"}),
 * })
 * ```
 */
export function json(
  jsobj: Parameters<typeof JSON.stringify>[0],
  init?: ResponseInit,
): Response {
  const headers = init?.headers instanceof Headers
    ? init.headers
    : new Headers(init?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }
  const statusText = init?.statusText ??
    STATUS_TEXT[(init?.status as typeof STATUS_CODE["NotFound"]) ?? STATUS_CODE.OK];
  return new Response(JSON.stringify(jsobj) + "\n", {
    statusText,
    status: init?.status ?? STATUS_CODE.OK,
    headers,
  });
}


export interface ServeStaticOptions {
  /** The base to be used for the construction of absolute URL. */
  baseUrl: string;
  /** A function to modify the response before it's served to the request.
   * For example, set appropriate content-type header.
   *
   * @default undefined */
  intervene?: (
    request: Request,
    response: Response,
  ) => Promise<Response> | Response;
}

/** Serve static files hosted on the internet or relative to your source code.
 *
 * Be default, up to 20 static assets that are less than 10MB are cached. You
 * can disable caching by setting `cache: false` in the options object.
 *
 * @example
 * ```
 * import { serve, serveStatic } from "https://deno.land/x/sift/mod.ts"
 *
 * serve({
 *  // It is required that the path ends with `:filename+`
 *  "/:filename+": serveStatic("public", { baseUrl: import.meta.url }),
 * })
 * ```
 */
export function serveStatic(
  relativePath: string,
  { baseUrl, intervene }: ServeStaticOptions,
): Handler {
  return async (
    request: Request,
    params: URLPatternComponentResult["groups"] | undefined,
    info: Deno.ServeHandlerInfo,
  ): Promise<Response> => {
    // Construct URL for the request resource.
    const filename = params?.filename;
    let filePath = relativePath;
    if (filename) {
      filePath = relativePath.endsWith("/")
        ? relativePath + filename
        : relativePath + "/" + filename;
    }
    const fileUrl = new URL(filePath, baseUrl);

    let response: Response | undefined;
    

    if (typeof response === "undefined") {
      const body = await Deno.readFile(fileUrl);
      response = new Response(body);
      const cType = contentType(String(filePath));
      if (cType) {
        response.headers.set("content-type", cType);
      }
      if (typeof intervene === "function") {
        response = await intervene(request, response);
      }
    }

    if (response.status == 404) {
      return routes[404](request, {}, info);
    }
    return response;
  };
}



export function Response404(props:{
  header_opt: NonNullable<ConstructorParameters<typeof Headers>[0]>
  log_msg?: string,
  resp_msg?: string,
}){
  const { header_opt, log_msg, resp_msg } = props
  if (log_msg){
    console.log(`\n${red("Failed")}: ${log_msg}`)
  }
  const headers = new Headers({...header_opt, "Content-Type":contentType("text/plain")})
  return new Response(resp_msg ?? "", {headers, status: 404})
}



export function siftLog(props:{
  title: string,
  title_color?: "green"|"red"|"blue"|"yellow"|"magenta"|"cyan",
  text: string
}){
  const { title, text } = props
  const funcs = {
    "green":green, "red":red, "blue":blue, "yellow":yellow, "magenta":magenta, "cyan":cyan
  }
  const color_func = props.title_color ? funcs[props.title_color] : cyan
  console.log(`[${color_func(title)}] ${text}`)
}


export function timeKeeper(
  title: string,
  title_color?: "green"|"red"|"blue"|"yellow"|"magenta"|"cyan"
){
  class timeKeeper {
    constructor(){
      const now = Date.now()
      this.startTime = now
      this.prevTime = now
      this.count = (msg:string) => {
        const nownow = Date.now()
        siftLog({title, title_color, text:`${msg}: ${nownow - this.prevTime}ms`})
        this.prevTime = nownow
      }
      this.total = () => {
        const nownow = Date.now()
        siftLog({title, title_color, text:`total: ${nownow - this.startTime}ms`})
        this.prevTime = nownow
      }
    }

    readonly startTime: number;
    prevTime: number;
    count: (arg:string) => void;
    total: () => void
  }

  return new timeKeeper()
}