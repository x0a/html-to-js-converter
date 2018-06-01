let gulp = require("gulp");
let pug = require("gulp-pug");
let ts = require("gulp-typescript");
let exec = require('child_process').exec;

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

gulp.task("update", done => {
	//copy dist folder into github-pages branch
	exec("git subtree push --prefix dist origin gh-pages", (err, stdout, stderr) => {
		done(err);
	})
})

gulp.task("default", gulp.series("pug", "ts"))

gulp.watch("src/*", gulp.series("default"));