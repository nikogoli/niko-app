export { setHTML, type ViewConfig, type SetViewProps } from "./by-esbuild/setHTML.tsx"

export {
  serve, serveStatic, ResponseWithFailedMsg,
  siftLog, timeKeeper,
  blue, green, red, yellow, cyan, magenta,
  type Handler, type Routes, type ServeStaticOptions,
} from "./utils/niko-router.ts"