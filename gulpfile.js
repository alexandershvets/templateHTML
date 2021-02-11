// VARIABLES & PATHS

let preprocessor = 'scss',
  fileswatch = 'html,htm,txt,json,md,woff2',
  imageswatch = 'jpg,jpeg,png,webp,svg,gif',
  online = true,
  project_folder = require("path").basename(__dirname),
  baseDir = 'app';

let paths = {
  styles: {
    src: `${baseDir}/**/${preprocessor}/main.*`,
    dest: `${baseDir}/css`,
    watch: `${baseDir}/**/${preprocessor}/**/*`
  },
  scripts: {
    src: [`${baseDir}/js/scripts/app.js`, `${baseDir}/js/scripts/vendors.js`],
    dest: `${baseDir}/js`,
    watch: `${baseDir}/js/scripts/**/*.js`
  },
  html: {
    includeSrc: [`${baseDir}/html/*.{html,php}`, `!${baseDir}/html/_*.{html,php}`],
    src: `${baseDir}/*.{html,php}`,
    dest: `${baseDir}/`,
    watch: `${baseDir}/html/**/*.{html,php}`
  },
  images: {
    src: [`${baseDir}/img/_src/**/*.{${imageswatch}}`, `!${baseDir}/img/_src/iconsfont/**/*`],
    dest: `${baseDir}/img/`,
    watch: `${baseDir}/img/_src/**/*.{${imageswatch}}`,
    del: [`${baseDir}/img/**/*`, `!${baseDir}/img/_src`, `!${baseDir}/img/favicon.{jpg,png,svg,gif,ico,webp}`]
  },
  fonts: {
    src: `${baseDir}/fonts/src/*.ttf`,
    dest: `${baseDir}/fonts/`,
    styleFile: `${baseDir}/${preprocessor}/_fonts.${preprocessor}`
  },
  build: {
    js: `${baseDir}/js/*.js`,
    css: `${baseDir}/css/*.css`,
    html: `${baseDir}/*.html`,
    fonts: `${baseDir}/fonts/*.{woff,woff2}`,
    images: [`${baseDir}/img/**/*.{${imageswatch}}`, `!${baseDir}/img/_src/**/*`, `!${baseDir}/img/favicon.{jpg,png,svg,gif,ico,webp}`],
    favicon: `${baseDir}/img/favicon.{jpg,png,svg,gif,ico,webp}`
  },
  resources: {
    src: `${baseDir}/resources/**`,
    dest: `${project_folder}/`,
  },
  deployFtp: {
    host: 'hostname.com',
    user: 'username',
    password: 'userpassword',
    parallel: 10,
    globs: [
      `${project_folder}/**`,
      // `${project_folder}/.htaccess`,
    ],
    base: `./${project_folder}/`,
    buffer: false,
    dest: '/www/alshvets.ru/',
  },
  deploy: {
    hostname: 'username@yousite.com', // Deploy hostname
    destination: 'yousite/public_html/', // Deploy destination
    include: [/* '*.htaccess' */], // Included files to deploy
    exclude: [ // Excluded files from deploy
      '**/Thumbs.db',
      '**/*.DS_Store',
    ]
  },
  cssOutputName: 'app.css',
  cssOutputNameMin: 'app.min.css'
};

// LOGIC

const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const gulpif = require('gulp-if');
const rename = require("gulp-rename");
const del = require('del');
const rsync = require('gulp-rsync');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const scss = require('gulp-sass');
const groupMedia = require("gulp-group-css-media-queries");
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');

const fonter = require('gulp-fonter');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');

const webp = require('gulp-webp');
const webpcss = require("gulp-webp-css");

const notify = require('gulp-notify');
const fileinclude = require("gulp-file-include");
const ftp = require('vinyl-ftp');

const fs = require('fs');


// DEVELOPMENT VARIABLES

const isProd = process.argv.includes('--prod'); // включает cleancss, uglify
const isDev = !isProd; // отключает cleancss, uglify
const isHtml = process.argv.includes('--html'); // включает такс html
const isWebp = process.argv.includes('--webp'); // включает конвертацию графики в webp
console.log('production mode: ', isProd);
console.log('development mode: ', isDev);
console.log('include html mode: ', isHtml);
console.log('image conversion mode: ', isWebp);

// FUNCTIONS

const browsersync = () => {
  browserSync.init({
    // proxy: 'test', // Раскоментировать, если нужно обновление PHP файлов
    server: { baseDir: baseDir + '/' }, // Закоментировать, если нужно обновление PHP файлов
    port: 3000,
    notify: false,
    online: online,
    open: false
  });
};

function scripts() {
  return src(paths.scripts.src)
    .pipe(fileinclude())
    .pipe(gulpif(isProd, dest(paths.scripts.dest)))
    .pipe(gulpif(isProd, uglify(/* options */).on("error", notify.onError())))
    .pipe(rename({
      suffix: ".min",
      extname: '.js'
    }))
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

function styles() {
  return src(paths.styles.src)
    .pipe(eval(preprocessor)({
      outputStyle: "expanded" // сжимание того что не нужно
    }).on('error', notify.onError()))
    .pipe(groupMedia())
    .pipe(autoprefixer({
      grid: true, // префиксы GRID Layout для IE 10 - 11
      overrideBrowserslist: ['last 5 versions'],
      cascade: false
    }))
    .pipe(gulpif(isWebp, webpcss(
      {
        webpClass: "._webp",
        noWebpClass: "._no-webp"
      }
    )))
    .pipe(gulpif(isProd, rename(paths.cssOutputName)))
    .pipe(gulpif(isProd, dest(paths.styles.dest)))
    .pipe(gulpif(isProd,
      cleancss({
        level: { 1: { specialComments: 0 } },
        // format: 'beautify', // читабельный формат
        // level: 2
      })
    ))
    .pipe(rename(paths.cssOutputNameMin))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

function htmlInclude() {
  if (isHtml) {
    return src(paths.html.includeSrc)
      .pipe(
        fileinclude({
          prefix: '@@',
          basepath: '@file'
        }).on("error", notify.onError())
      )
      .pipe(dest(paths.html.dest))
      .pipe(browserSync.stream());
  }
}

function html() {
  return src(paths.html.src)
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
}

function images() {
  return src(paths.images.src)
    .pipe(gulpif(isWebp, newer(paths.images.dest)))
    .pipe(gulpif(isWebp, webp({
      quality: 75
    })))
    .pipe(gulpif(isWebp, dest(paths.images.dest)))
    .pipe(src(paths.images.src))
    .pipe(newer(paths.images.dest))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      interlaced: true,
      optimizationLevel: 3 // 0 to 7
    }))
    .pipe(dest(paths.images.dest));
}

function cleanimg() {
  return del(paths.images.del, { force: true });
}

function fonts() {
  src(paths.fonts.src)
    .pipe(ttf2woff())
    .pipe(dest(paths.fonts.dest));
  return src(paths.fonts.src)
    .pipe(ttf2woff2())
    .pipe(dest(paths.fonts.dest))
    .pipe(browserSync.stream());
}

function otf2ttf() {
  return src([`${baseDir}/fonts/src/*.otf`])
    .pipe(fonter({
      formats: ['ttf']
    }))
    .pipe(dest(`${baseDir}/fonts/src/**/`));
}

const checkWeight = (fontname) => {
  let weight = 400;
  switch (true) {
    case /Thin/.test(fontname):
      weight = 100;
      break;
    case /ExtraLight/.test(fontname):
      weight = 200;
      break;
    case /Light/.test(fontname):
      weight = 300;
      break;
    case /Regular/.test(fontname):
      weight = 400;
      break;
    case /Medium/.test(fontname):
      weight = 500;
      break;
    case /SemiBold/.test(fontname):
      weight = 600;
      break;
    case /Semi/.test(fontname):
      weight = 600;
      break;
    case /Bold/.test(fontname):
      weight = 700;
      break;
    case /ExtraBold/.test(fontname):
      weight = 800;
      break;
    case /Heavy/.test(fontname):
      weight = 700;
      break;
    case /Black/.test(fontname):
      weight = 900;
      break;
    default:
      weight = 400;
  }
  return weight;
};

async function fontsStyle() {
  let file_content = fs.readFileSync(paths.fonts.styleFile);
  if (file_content == '') {
    fs.writeFile(paths.fonts.styleFile, '', cb);
    return fs.readdir(paths.fonts.dest, function (err, items) {
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split('.');
          fontname = fontname[0];

          let font = fontname.split('-')[0];
          let weight = checkWeight(fontname);

          if (c_fontname != fontname) {
            fs.appendFile(paths.fonts.styleFile, '@include font("' + font + '", "' + fontname + '", ' + weight + ', "normal");\r\n', cb);
          }
          c_fontname = fontname;
        }
      }
    })
  }
}
function cb() { }

function cleandist() {
  return del(`${project_folder}/**/*`, { force: true });
}

function resources() {
  return src(paths.resources.src)
    .pipe(dest(paths.resources.dest));
}

function startwatch() {
  watch(paths.styles.watch, { usePolling: true }, styles);
  watch(paths.scripts.watch, { usePolling: true }, scripts);
  if (isHtml) {
    watch(paths.html.watch, { usePolling: true }, htmlInclude);
  } else {
    watch(paths.html.watch, { usePolling: true }, html);
  }
  watch(`${baseDir}/**/*.{${fileswatch}}`, { usePolling: true },).on('change', browserSync.reload);
  watch(`${baseDir}/**/*.{${imageswatch}}`, { usePolling: true }, images);
  watch(`${baseDir}/**/*.php`, { usePolling: true }).on('change', browserSync.reload);
}

// BUILD
function buildcopy() {
  src([
    paths.build.js,
    paths.build.css,
    paths.build.html,
    paths.build.fonts
  ], { base: baseDir })
    .pipe(dest(project_folder + '/'));

  src(paths.build.favicon)
    .pipe(rename({ extname: ".ico" }))
    .pipe(dest(project_folder + '/img/'));

  return src(paths.build.images)
    .pipe(dest(project_folder + '/img/'));
}

// DEPLOY FTP
function deployFtp() {
  let conn = ftp.create({
    host: paths.deployFtp.host,
    user: paths.deployFtp.user,
    password: paths.deployFtp.password,
    parallel: paths.deployFtp.parallel
  });

  let globs = paths.deployFtp.globs;

  return src(globs, {
    base: paths.deployFtp.base,
    buffer: paths.deployFtp.false
  })
  .pipe(conn.newer(paths.deployFtp.dest))
  .pipe(conn.dest(paths.deployFtp.dest));
}

// DEPLOY rsync
function deploy() {
  return src(baseDir + '/') // project_folder
    .pipe(rsync({
      root: baseDir + '/',
      hostname: paths.deploy.hostname,
      destination: paths.deploy.destination,
      include: paths.deploy.include,
      exclude: paths.deploy.exclude,
      recursive: true,
      archive: true,
      silent: false,
      compress: true
    }));
}

exports.browsersync = browsersync;
exports.assets = series(cleanimg, styles, scripts, fonts, images, fontsStyle);
exports.fontsStyle = fontsStyle;
exports.scripts = scripts;
exports.styles = styles;
exports.htmlInclude = htmlInclude;
exports.html = html;
exports.images = images;
exports.cleanimg = cleanimg;
exports.cleandist = cleandist;
exports.fonts = fonts;
exports.otf2ttf = otf2ttf;
exports.resources = resources;
exports.deploy = deploy;
exports.deployFtp = deployFtp;
exports.build = series(cleandist, styles, scripts, images, html, fonts, buildcopy, resources);
exports.default = parallel(styles, scripts, htmlInclude, images, fonts, browsersync, startwatch);
