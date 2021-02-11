# templateHTML
HTML starter template

## Особенности

- препроцессор на выбор, **sass / scss**
- конвертация шрифтов из `.ttf` в форматы `.woff` и `.woff2`
- конвертация шрифтов из `.otf` в формат `.ttf`
- конвертация изображений в формат `.webp`
- деплой на сервер ( плагины **gulp-rsync**, **vinyl-ftp**)
- выбор, использовать шаблонизатор html файлов (плагин **gulp-file-include**), или нет. Если да, то команда `gulp --html`, если нет, то просто `gulp`

## Файловая структура

```
templateHTML
├── dist
├── app
│   ├── css
│   ├── fonts
│   ├── html
│   ├── images
│   ├── js
│   ├── resources
│   ├── sass
│   └── scss
│       index.html
├── .gitignore
├── gulpfile.js
└── package.json
```

## Команды

- `gulp`  - режим разработки
- `gulp --prod`  - режим разработки c оптимизацией js и css файлов
- `gulp --html`  - режим разработки с шаблонизацией html (плагин gulp-file-include)
- `gulp --webp`  - режим разработки с конвертированием изображегий в формат webp
- `gulp build`  - билд проекта
- `gulp assets`  - пересобрать файлы
- `gulp html`  - собрать html-файлы
- `gulp styles` - скомпилировать SASS/SCSS-файлы
- `gulp scripts` - собрать JS-файлы
- `gulp images`  -  собрать изображения
- `gulp clearimg`   - удалить оптимизированные изображения
- `gulp fonts`  - сконвертировать шрифты в форматы .woff и .woff2
- `gulp cleardist`   - удалить содержимое папки билда
- `gulp otf2ttf`    - конвертация шрифтов .otf  в .ttf
- `gulp resources`  - перенос ресурсов в папку билда
- `gulp deployFtp`  - деплой на сервер через FTP
- `gulp deploy`  - молниеносный деплой на сервер

## Контакты

Telegram:  @alexandershvets
