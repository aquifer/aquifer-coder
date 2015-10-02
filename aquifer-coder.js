/**
 * @file
 * Coding standards sniffers and linters for Aquifer.
 */

module.exports = function(Aquifer, AquiferCoderConfig) {

  'use strict';

  var AquiferCoder = function () {},
      colors       = require('colors'),
      _            = require('underscore'),
      path         = require('path'),
      fs           = require('fs-extra');

  /**
   * Creates a 'cs' command.
   * @return {object} commands to be added to Aquifer.
   */
  AquiferCoder.commands = function () {
    return {
      'jslint': {
        description: 'Sniffs the custom code in a project for coding standards violations and linting errors.'
      }
    };
  };

  /**
   * Sniffs custom code for problems when 'aquifer cs' is invoked.
   * @param string command string representing the name of the command that is being run.
   * @param object options options passed from the command.
   * @param function callback function that is called when there is an error message to send.
   */
  AquiferCoder.run = function (command, options, callback) {
    if (command === 'jslint') {
      AquiferCoder.eslint();
    }
  }

  /**
   * Scan aquifer project source dirs for js issues.
   */
  AquiferCoder.eslint = function () {
    var CLIEngine = require('eslint').CLIEngine;

    // Decide on an rc file for eslint.
    var configFile = AquiferCoderConfig.eslintrc ? AquiferCoderConfig.eslintrc : '.eslintrc';
    if (!fs.existsSync(path.join(Aquifer.project.directory, configFile))) {
      configFile = path.join(__dirname, 'src', '.eslintrc');
    }

    // Create instance of eslint cli engine.
    var eslint = new CLIEngine({
      envs: ['browser'],
      useEslintrc: true,
      configFile: configFile
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
        console.log(item.filePath.bgGreen);
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
        console.log(log + '\n');
      });
    });
  }

  return AquiferCoder;
};
