// @deno-types="./gluon_deno/gluon.d.ts"
export * as Gluon from "./gluon_deno/index.js"

// この mod.ts からインポートすると、↑ の記述によって https://deno.land/std@0.170.0/flags/mod.ts がインポートされ
// その依存関係でインポートされる constant.ts 内における "Deno.xxx"" の記述によってブラウザがエラーを起こす可能性あり
export * as NkUtils from "./gluon_utils/mod.ts"
export * as NkAssets from "./assets/mod.ts"