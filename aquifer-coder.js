/**
 * @file
 * Coding standards sniffers and linters for Aquifer.
 */

/**
 * Object containing Aquifer extension API methods to be invoked.
 */
var AquiferCodingStandards = function(Aquifer, config) {
  var self = this;
  self.config = config;

  /**
   * Creates a 'cs' command.
   * @return {object} commands to be added to Aquifer.
   */
  self.commands = function () {
    return {
      'cs': {
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
  self.run = function (command, options, callback) {
    console.log('yay');
  }

  return self;
};

module.exports = AquiferCodingStandards
