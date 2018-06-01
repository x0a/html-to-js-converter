let gulp = require("gulp");
let pug = require("gulp-pug");
let ts = require("gulp-typescript");

gulp.task("pug", () => {
    return gulp.src("src/*.pug")
    .pipe(pug())
    .pipe(gulp.dest("dist"));
})

gulp.task("ts", () => {
    return gulp.src("src/*.ts")
    .pipe(ts())
    .pipe(gulp.dest("dist"))
})

gulp.task("default", gulp.series("pug", "ts"))

gulp.watch("src/*", gulp.series("default"));