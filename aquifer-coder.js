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

  // Turn any passed-in paths into full paths.
  if (AquiferCoderConfig.hasOwnProperty('eslint')) {
    if (AquiferCoderConfig.hasOwnProperty('standard')) {
      AquiferCoderConfig.eslint.standard = path.join(Aquifer.projectDir, AquiferCoderConfig.eslint.standard);
    }

    if (AquiferCoderConfig.hasOwnProperty('ignore')) {
      AquiferCoderConfig.eslint.ignore = path.join(Aquifer.projectDir, AquiferCoderConfig.eslint.ignore);
    }
  }

  if (AquiferCoderConfig.hasOwnProperty('phpcs')) {
    if (AquiferCoderConfig.hasOwnProperty('standard')) {
      AquiferCoderConfig.phpcs.standard = path.join(Aquifer.projectDir, AquiferCoderConfig.phpcs.standard);
    }
  }

  // Create defaults for options.
  _.defaults(AquiferCoderConfig, {
    eslint: {
      config: path.join(__dirname, 'src', '.eslintrc'),
      ignore: path.join(__dirname, 'src', '.eslintignore'),
      targets: [
        './modules/custom',
        'themes/custom',
        '*.js'
      ]
    },
    phpcs: {
      config: path.join(__dirname, '/vendor/drupalmodule/coder/coder_sniffer/Drupal'),
      ignore: "*.apachesolr_environments.inc,*.apachesolr_search_defaults.inc,*.context.inc,*.features.*.inc,*.features.inc,*.field_group.inc,*.pages_default.inc,*.strongarm.inc,*.views_default.inc",
      targets: [
        'modules/custom',
        'themes/custom'
      ],
      extensions: 'php,module,inc,install,test,profile,theme'
    }
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
      if (AquiferCoderConfig.hasOwnProperty('eslint')
        && AquiferCoderConfig.eslint.hasOwnProperty('targets')
        && AquiferCoderConfig.eslint.targets.length) {
        Aquifer.console.log('Running linters on JavaScript code files...', 'notice');
        AquiferCoder.eslint(AquiferCoderConfig.eslint.targets);
      }
      else {
        Aquifer.console.log('No targets defined for Javascript linting.', 'notice');
      }
    }

    if (command === 'phplint' || command === 'lint') {
      if (AquiferCoderConfig.hasOwnProperty('phpcs')
        && AquiferCoderConfig.phpcs.hasOwnProperty('targets')
        && AquiferCoderConfig.phpcs.targets.length) {
        Aquifer.console.log('Running linters on PHP code files...', 'notice');
        AquiferCoder.phplint(AquiferCoderConfig.phpcs.targets);
        Aquifer.console.log('Running coding standards sniffers on PHP code files...', 'notice');
        AquiferCoder.phpcs(AquiferCoderConfig.phpcs.targets);
      }
      else {
        Aquifer.console.log('No targets defined for PHP linting.', 'notice');
      }
    }
  }

  /**
   * Run eslint on custom files in project.
   * @returns {undefined} nothing.
   */
  AquiferCoder.eslint = function (targets) {
    var CLIEngine = require('eslint').CLIEngine;

    // Create instance of eslint cli engine.
    var eslint = new CLIEngine({
      envs: ['browser'],
      useEslintrc: true,
      configFile: AquiferCoderConfig.eslint.config,
      ignore: true,
      ignorePath: AquiferCoderConfig.eslint.ignore
    });

    // Execute eslint on js files.
    var report = eslint.executeOnFiles(targets);

    // Loop through report results, and log accordingly.
    _.forEach(report.results, function (item) {
      // If no errors are found.
      if (item.messages.length <= 0) {
        console.log(item.filePath.black.bgGreen + '\n');
        return;
      }

      // If errors are found, log filename, and construct error string.
      console.log(item.filePath.black.bgRed);
      var log = '';
      _.forEach(item.messages, function(message) {
        log = '';
        if (message.fatal) {
          log += 'Fatal ';
        }

        log += 'Error on line ' + new String(message.line).bold + ' column ' + new String(message.column).bold + ': ' + new String(message.message).red;
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
  AquiferCoder.phplint = function (targets) {
    // Load phplint, and set up extensions.
    let phplint = require('phplint').lint,
        extensions = '{' + AquiferCoderConfig.phpcs.extensions + '}',
        files = [];

    _.forEach(targets, function(target) {
      let absolutePath = path.join(Aquifer.project.directory, target);

      // If the target is a directory, append the wildcards and extensions.
      if (fs.lstatSync(absolutePath).isDirectory()) {
        files.push(absolutePath + '/**/*.' + extensions);
      }
      else {
        files.push(absolutePath);
      }
    });

    // Run phplint on custom modules and themes.
    phplint(files, function (err) {
      if (err) {
        console.log(err.message);
      }
    });
  }

  /**
   * Runs phpcs on PHP code in codebase.
   * @returns {undefined} nothing.
   */
  AquiferCoder.phpcs = function (targets) {
    // Define phpcs command and options as an array.
    let command = [
      path.join(__dirname, '/vendor/bin/phpcs'),
      '--standard="' + AquiferCoderConfig.phpcs.config + '"',
      '--extensions="' + AquiferCoderConfig.phpcs.extensions + '"',
      '--ignore="' + AquiferCoderConfig.phpcs.ignore + '"'
    ];

    // Add target directories to the command array.
    _.forEach(targets, function(target) {
      command.push(path.join(Aquifer.project.directory, target));
    });

    // Execute phpcs.
    var report = syncExec(command.join(' '));

    // Log phpcs errors.
    if (report.stdout.length > 0) {
      // Log report, and remove silly Code Sniffer 2.0 ad.
      console.log(report.stdout.split('UPGRADE TO PHP_CODESNIFFER 2.0 TO FIX ERRORS AUTOMATICALLY')[0]);
    }
  }

  return AquiferCoder;
};
