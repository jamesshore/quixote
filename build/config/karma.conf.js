// Karma configuration
// Generated on Mon Sep 29 2014 15:15:28 GMT-0700 (PDT)
"use strict";

module.exports = function(config) {
	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '../../',


		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['mocha', 'commonjs'],


		// list of files / patterns to load in the browser
		files: [
			'src/**/*.js',
			'src/**/*.html',
			'src/**/*.css',
			'vendor/**/*.js',
			'test/**/*.js'
		],


		// list of files to exclude
		exclude: [],


		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			// this glob avoids processing the *_script_test.js files, which will be loaded as <script> tags
			'src/**/{*.,!(*_script_test)}.js': ['commonjs'],
			'vendor/**/*.js': ['commonjs'],
			'test/**/*.js': ['commonjs']
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['dots'],

		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
//    logLevel: config.LOG_INFO,
		logLevel: config.LOG_INFO,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,


		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: [],


		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false,


		// We've increased the following from standard values due to CPU-intensive tests
		// causing Karma to think browser has disconnected.
		browserNoActivityTimeout: 30 * 1000,
		browserDisconnectTimeout: 30 * 1000


	});
};
