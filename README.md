# codemagic-tools

[![GitHub Actions CI](https://github.com/js-soft/codemagic-tools/workflows/Publish/badge.svg)](https://github.com/js-soft/codemagic-tools/actions?query=workflow%3APublish)
[![npm version](https://badge.fury.io/js/@js-soft%2fcodemagic-tools.svg)](https://www.npmjs.com/package/@js-soft/codemagic-tools)

Codemagic Tools is a collection of tools to be used in Codemagic CI/CD pipelines.

## Installation

```bash
npm install @js-soft/codemagic-tools
```

## Usage

### Teams Messaging

#### Develop Messages

```bash
jscm teams-develop --platform <platform> --projectName <projectName>
```

This command will inform about a new development build and additionally provide a link to the build. In case of a failed build it will also provide a link to the build log.

### Production Messages

```bash
jscm teams-publish --platform <platform> --projectName <projectName>
```

This command will inform about an app version, that was released in a store. It additionally provides a link to the build logs.

## Testing

For testing a JSON like created in Codemagic is provided. Additionally a bash-script, which
can be used to test the command is provided. Upon execution the
test script will ask you to specify the following variables:

- webhook - webhook url you want to send to / or just some valid https-address
- BuildId - a string
- ProjectId - a string
- buildNumber - a number

After preparation of your local environment the script will execute the jscm command.

It will execute both possible command:

- teams-develop (in failed/successful state/without artifacts)
- teams-production (in failed/successful state/without artifacts)

&rarr; This will result in 4(2 failed/2 successful) messages being sent to the specified teams channel as well as 2 exceptions exceptions.

### Calling the test script

```bash
./test/test_teams_messaging.sh
```

## License

[MIT](LICENSE)
