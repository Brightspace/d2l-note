
/* eslint-disable no-console */

'use strict';

const changeCase = require('change-case');
const gulp = require('gulp');
const ejs = require('gulp-ejs');
const mergeStream = require('merge-stream');
const rename = require('gulp-rename');
const requireDir = require('require-dir');

const langOutputDir = 'src/lang/locales';
const localeResources = requireDir('src/lang/json');

const config = {
	dest: langOutputDir,
	localeFiles: Object.keys(localeResources).map((lang) => ({
		filename: lang,
		data: {
			lang,
			properLang: changeCase.camel(lang),
			resources: JSON.stringify(localeResources[lang], null, '\t'),
		},
	}))
};

function createLocalizationFiles() {
	const options = {
		client: true,
		strict: true,
		root: 'src/lang/locales',
		localsName: 'data'
	};

	console.log('Creating localization files...');

	return mergeStream(config.localeFiles.map(({ filename, data }) =>
		gulp.src('./src/lang/util/lang-resource.ejs')
			.pipe(ejs(data, options))
			.pipe(rename({
				basename: filename,
				extname: '.ts'
			}))
			.pipe(gulp.dest(options.root)))
	);
}

gulp.task('localize', createLocalizationFiles);
