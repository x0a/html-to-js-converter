let gulp = require("gulp");
let pug = require("gulp-pug");
let exec = require('child_process').exec;
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");

gulp.task("pug", () => {
    return gulp.src("src/*.pug")
    .pipe(pug())
    .pipe(gulp.dest("dist"));
})

gulp.task("ts", () => {
    return browserify({entries: ["src/index.ts"]})
    .plugin(tsify)
    .bundle()
    .pipe(source("index.js"))
    .pipe(gulp.dest("dist/"))
})

gulp.task("update", done => {
    //copy dist folder into github-pages branch
    exec("git subtree push --prefix dist origin gh-pages", (err, stdout, stderr) => {
        done(err);
    })
})

gulp.task("default", gulp.series("pug", "ts"))

gulp.watch("src/*", gulp.series("default"));