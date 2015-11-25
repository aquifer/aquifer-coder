/**
 * @file
 * Coding standards sniffers and linters for Aquifer.
 */

/**
 * Extension that is exported to Aquifer.
 * @param {object} Aquifer instance of Aquifer containing an active project.
 * @param {object} AquiferCoderConfig config object passed in from Aquifer project's json file.
 * @returns {function} object that consumes Aquifer's extension API.
 */
module.exports = function(Aquifer, AquiferCoderConfig) {

  'use strict';

  var AquiferCoder = function () {},
      colors       = require('colors'),
      _            = require('lodash'),
      path         = require('path'),
      fs           = require('fs-extra'),
      syncExec     = require('sync-exec');

  // Create defauts for options.
  _.defaults(AquiferCoderConfig, {
    eslintrc: path.join(__dirname, 'src', '.eslintrc'),
    eslintIgnore: path.join(__dirname, 'src', '.eslintignore'),
    phpcsStandard: path.join(__dirname, '/vendor/drupalmodule/coder/coder_sniffer/Drupal')
  });

  /**
   * Creates a commands that are exported to Aquifer command.
   * @returns {object} commands to be added to Aquifer.
   */
  AquiferCoder.commands = function () {
    return {
      'jslint': {
        description: 'Lints JavaScript code in the project for errors.'
      },
      'phplint': {
        description: 'Lints PHP code in the project for errors.'
      },
      'lint': {
        description: 'Lints PHP and JavaScript code in the project for errors.'
      }
    };
  };

  /**
   * Runs sniffers and linters depending on the command being run.
   * @param {string} command string representing the name of the command that is being run.
   * @param {object} options options passed from the command.
   * @param {function} callback function that is called when there is an error message to send.
   * @returns {undefined} nothing.
   */
  AquiferCoder.run = function (command, options, callback) {
    if (command === 'jslint' || command === 'lint') {
      Aquifer.console.log('Running linters on JavaScript code files...', 'notice');
      AquiferCoder.eslint();
    }
    if (command === 'phplint' || command === 'lint') {
      Aquifer.console.log('Running linters on PHP code files...', 'notice');
      AquiferCoder.phplint();
      Aquifer.console.log('Running coding standards sniffers on PHP code files...', 'notice');
      AquiferCoder.phpcs();
    }
  }

  /**
   * Run eslint on custom files in project.
   * @returns {undefined} nothing.
   */
  AquiferCoder.eslint = function () {
    var CLIEngine = require('eslint').CLIEngine;

    // Create instance of eslint cli engine.
    var eslint = new CLIEngine({
      envs: ['browser'],
      useEslintrc: true,
      configFile: AquiferCoderConfig.eslintrc,
      ignore: true,
      ignorePath: AquiferCoderConfig.eslintIgnore
    });

    // Execute eslint on js files.
    var report = eslint.executeOnFiles([
      Aquifer.project.absolutePaths.modules.custom,
      Aquifer.project.absolutePaths.modules.features,
      Aquifer.project.absolutePaths.themes.custom,
      Aquifer.project.directory + '/*.js'
    ]);

    // Loop through report results, and log accordingly.
    _.forEach(report.results, function (item) {
      // If no errors are found.
      if (item.messages.length <= 0) {
        console.log(item.filePath.bgGreen + '\n');
        return;
      }

      // If errors are found, log filename, and construct error string.
      console.log(item.filePath.bgRed);
      var log = '';
      _.forEach(item.messages, function(message) {
        log = '';
        if (message.fatal) {
          log += 'Fatal ';
        }

        log += 'Error on line ' + new String(message.line).bgYellow + ' column ' + new String(message.column).bgYellow + ': ' + new String(message.message).red;
        console.log(log);
      });

      // newline.
      console.log();
    });
  }

  /**
   * Lints PHP code in codebase.
   * @returns {undefined} nothing.
   */
  AquiferCoder.phplint = function () {
    // Load phplint, and set up extensions.
    var phplint = require('phplint').lint,
        extensions = '{php,module,inc,install,test,profile,theme}';

    // Run phplint on custom modules and themes.
    phplint([
      Aquifer.project.absolutePaths.modules.custom + '/**/*.' + extensions,
      Aquifer.project.absolutePaths.modules.features + '/**/*.' + extensions,
      Aquifer.project.absolutePaths.themes.custom + '/**/*.' + extensions
    ], function (err) {
      if (err) {
        console.log(err.message);
      }
    });
  }

  /**
   * Runs phpcs on PHP code in codebase.
   * @returns {undefined} nothing.
   */
  AquiferCoder.phpcs = function () {
    var command = [
      path.join(__dirname, '/vendor/bin/phpcs'),
      '--standard="' + AquiferCoderConfig.phpcsStandard + '"',
      '--extensions="php,module,inc,install,test,profile,theme"',
      '--ignore="*.apachesolr_environments.inc,*.apachesolr_search_defaults.inc,*.context.inc,*.features.*.inc,*.features.inc,*.field_group.inc,*.pages_default.inc,*.strongarm.inc,*.views_default.inc"',
      Aquifer.project.absolutePaths.modules.custom,
      Aquifer.project.absolutePaths.modules.features,
      Aquifer.project.absolutePaths.themes.custom
    ].join(' ');

    var report = syncExec(command);
    if (report.stdout.length > 0) {
      // Log report, and remove silly Code Sniffer 2.0 ad.
      console.log(report.stdout.split('UPGRADE TO PHP_CODESNIFFER 2.0 TO FIX ERRORS AUTOMATICALLY')[0]);
    }
  }

  return AquiferCoder;
};
