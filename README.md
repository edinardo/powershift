# PowerShift Smart Thermostat

Control your PowerShift Smart Thermostat using Google Assistant.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Node 8+

```
Give examples
```

### Installing

A step by step series of examples that tell you how to get a development env running

Say what the step will be

```
Give the example
```

When try to test the draft if gets the following error:

GoogleFulfillment ‘actions.fulfillment.devices’ is not supported

Proceed with this  manual workaround:

* Download the gactions cli at https://developers.google.com/actions/tools/gactions-cli
* Authenticate with any command, like:

```
./gactions list --project [YOUT_PROJECT_ID]
```

* Download the json representation of your action:

```
./gactions get --project [YOUR_PROJECT_ID] --version draft > action.json
```

* Edit the json to extract the only object from its array, and remove the nested “googleFulfillments” object.
* Push your fixed action into test:

```
./gactions test --project [YOUR_PROJECT_ID] --action_package ./action.json
```

This replaces the step 3 "Click Simulator under TEST" in the google assistant manual setup. Also seems to work longer than 3 days without re-deploying.

## Running the tests

Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
* [Maven](https://maven.apache.org/) - Dependency Management
* [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Billie Thompson** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone whose code was used