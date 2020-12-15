module.exports = (() => {

    // base path of app
    var basepath = 'app',
        tempdir = '.tmp',
        coreBasePath = 'ssg-core-engine',
        appdir = process.cwd() + '/' + basepath;

    var config = {
        server: {
            notify: false,
            port: 9000,
            server: {
                baseDir: [basepath, tempdir, 'ssg-core/ui', 'node_modules'],
                routes: {
                    '/ssg-core/ui': '/',
                    '/node_modules': '/'
                }
            },
            https: true
        },
        tsconfig: 'tsconfig.json',
        ssgCoreTemp: './ssg-core-tmp',
        // core settings
        styles: '/styles/',
        scripts: '/script/',
        documentation: {
            path: '/scripts/ssg.doc.js'
        },
        ssg: {
            path: basepath + '/_patterns/**/*.hbs',
            config: basepath + '/_config/pattern.conf.json',
            partials: [
                basepath + '/_patterns/**/*.hbs',
                basepath + '/_core/**/_*.hbs'
            ],
            templates: [
                basepath + '/_patterns/**/[^_]*.hbs'
            ],
            namespace: 'ssg.templates',
            target: tempdir + "/"
        },
        watches: {
            styles: basepath + '/styles/**/*.scss',
            
            scriptsTS: basepath + '/scripts/**/*.ts',
            scriptsJS: basepath + '/scripts/**/*.js',
            ssg: [
                basepath + '/_patterns/**/[^_]*.hbs'
            ],
            documentation: basepath + '/_documentation/**/*.md',
            staticFiles: [
                appdir + '/_config/**.conf.json',
                appdir + '/_data/**.js*',
                appdir + '/**/*.html'
            ]
        },
        watchesCore: {
            styles: coreBasePath + '/styles/**/*.scss',
            scripts: coreBasePath + '/scripts/**/*.ts'
        },
        target: {
            styles: tempdir + '/styles/',
            scripts: tempdir + '/scripts/'
        }
    }

    return config;

})();