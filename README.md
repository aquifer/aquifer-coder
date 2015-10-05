# aquifer-coder
Coding standards sniffing and linting utility for Aquifer projects.

## Installation
To install this extension, in your Aquifer project, run:

```bash
aquifer extension-add aquifer-coder
```

## Use
This extension adds a few commands to the Aquifer CLI within your project:

* `aquifer lint` - Lints all code files in all directories containing custom code.
* `aquifer jslint` - Lints JavaScript code files in all directories containing custom code.
* `aquifer phplint` - Lints PHP code files in all directories containing custom code.

Running any of these commands will create a report that outlines any coding standards violations or linting errors in your codebase. A default set of eslint rules is provided, and the Drupal Coding Standards PHPCodesniffer rules are used.

## Configuration
You might not want to use the eslint rules provided with this extension, or the Drupal Coding Standards. This extension provides two optional parameters:

_in your `aquifer.json` file:_
```javascript
...
"extensions": {
  "aquifer-coder": {
    "source": "aquifer-coder",
    "eslintrc": "/path/to/eslintrc",
    "phpcsStandard": "/path/to/phpcsStandardFile"
  }
}
...

```
