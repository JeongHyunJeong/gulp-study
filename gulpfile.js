const gulp = require('gulp');
var browserSync = require('browser-sync');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var htmlhint = require('gulp-htmlhint');
var minifyhtml = require('gulp-minify-html');
var replace = require('gulp-replace');
var jshint = require('gulp-jshint');
var jsbeautify = require('gulp-jsbeautifier');

var less = require('gulp-less');
var inject = require('gulp-inject');
var useref = require('gulp-useref');
var rimraf = require('rimraf');
var rename = require('gulp-rename');

var devMode = true;

var src = 'app';
var dist = 'dist';

var paths = {
    js : src + '/scripts/{,**/}*.js',
    html : src + '/{views, templates}/{,**/}*.html',
    less : src + '/styles/{,**/}*.less',
    index : src + '*.html'
}

// clean files in dist folder
function clean(cb){
    rimraf(dist + '/{*,.*}', cb);
}

// beautify html, js, css files
function beautify(){
    return gulp.src([ paths.js, paths.html, paths.index ], { base : './'})
            .pipe(jsbeautify())
            .pipe(jsbeautify.reporter())
            .pipe(gulp.dest('./'));
}

// 
function hintHtml(){
    return gulp.src(paths.html)
            .pipe(htmlhint('.htmlhintrc'))
            .pipe(htmlhint.failOnError());
}

function minifyHtml(){
    return gulp.src(paths.html, { sourcemaps : devMode })
            .pipe(minifyhtml())
            .pipe(gulp.dest(dist + '/'))
            .pipe(browserSync.reload({ stream : true }))
}

function replace(){
    if (devMode) {
        //
        var obj = require('./config/environments/development.json');
        var replaceTarget = Object.keys(obj)[0];
        return gulp.src('./config/config.js')
            .pipe(replace('@@' + replaceTarget, obj[replaceTarget]))
            .pipe(gulp.dest(app + '/scripts/services/'));
    } else {
        // 
        return  gulp.src(dist + '/{views, templates}/{,**/}*.html')
            .pipe(replace('@@appVersion',''))
            .pipe(replace('@@appSHA', ''))
            .pipe(replace('@@appLastCommitTime', ''))
            .pipe(replace(/<pre>(.|\s)*?<\/pre>/m, ''));
    }
}

function combineJs(){
    return gulp.src(paths.js, { sourcemaps : devMode })
            .pipe(concat('app.js'))
            .pipe(uglify())
            .pipe(gulp.dest(dist + '/scrips'))
            .pipe(browserSync.reload({stream : true}));
}

// less-css
function lessCss(){
    var LessAutoprefix = require('less-plugin-autoprefix');
    var autoprefix = new LessAutoprefix({ browsers : ['last 1 version'] });
    var settingTarget = devMode ? '/env/development.less' : '/env/dist.less';

    return gulp.src('./styles/' + settingTarget)
        .pipe(less({
            plugins: [autoprefix],
        }))
        .pipe(rename('setting.css'))
        .pipe(gulp.src('./styles/{uikit,t2tr}.less'), { passthrough : true })
        .pipe(less({
            plugins : [autoprefix]
        }))
        .pipe(gulp.dest(dist + '/styles/'));
}

function hintJs(){
    return gulp.src(paths.js, { since : gulp.lastRun('jshint')} )
            .pipe(jshint())
            .pipe(jshint.reporter('jshint-stylish'))
            .pipe(jshint.reporter('fail'));
}

function server(){
    return browserSync.init({
        server : {
            baseDir : './dist',
            index : 'index.html'
        }
    });
}

function watch(){
    gulp.watch(paths.js, []);
    gulp.watch(paths.html, []);
    gulp.watch(paths.css, []);
    
}

function copy(){
    return gulp.src(
            [ paths.html, paths.js, paths.index ], 
            { base : app })
            .pipe(gulp.dest(dist));
}

function useref(){
    return gulp.src(paths.index)
            .pipe(useref())
            .pipe(gulp.dest(dist));
}


function inject(){
    var sources = gulp.src(['node_modules'], {read: false});
    return gulp.src(paths.index)
            .pipe(inject(sources))
            .pipe(gulp.dest(dist));
}

function test(){

}

function build(){

}

function deploy(target){

}

// exports.build = series(clean, inject, replace, useref);
// exports.default = series(test, build);

exports.clean = clean;

exports.less = lessCss;

exports.beautify = beautify;

exports.htmlhint = hintHtml;
exports.jshint = hintJs;