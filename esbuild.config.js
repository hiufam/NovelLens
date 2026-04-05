import esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");

const ctx = await esbuild.context({
  entryPoints: ["app/javascript/application.js"],
  bundle: true,
  sourcemap: true,
  outdir: "app/assets/builds",
  format: "esm", // You need to set the output format to "esm" for "import.meta" to work correctly.
});

if (isWatch) {
  await ctx.watch();
  console.log("Watching build...");
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
