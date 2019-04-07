# PowerShift Smart Thermostat

Control your PowerShift Smart Thermostat using Google Assistant.

## Getting Started

These instructions will get you a copy of the project up and running on your Firebase account for development and testing purposes.

### Prerequisites

Node.js 8+

Firebase 3.3+

### Installing

Need to be documented, but for now follow the steps 2 at:

[smarthome Codelab](https://codelabs.developers.google.com/codelabs/smarthome-washer/#1)

## Deployment

Need to be documented, but for now follow the steps 3 at (pointing to your deployment):

[smarthome Codelab](https://codelabs.developers.google.com/codelabs/smarthome-washer/#2)

## Running the tests

When try to test the draft using the last steps, if gets the following error:

GoogleFulfillment ‘actions.fulfillment.devices’ is not supported

Proceed with this manual workaround:

* Download the gactions cli at https://developers.google.com/actions/tools/gactions-cli
* Authenticate with any command, like:

```
./gactions list --project [YOUT_PROJECT_ID]
```

* Download the JSON representation of your action (without this step, the file on the repository points to the original server is up and running, not to your code):

```
./gactions get --project [YOUR_PROJECT_ID] --version draft > action.json
```

* Edit the JSON to extract the only object from its array, and remove the nested “googleFulfillments” object.
* Push your fixed action into test:

```
./gactions test --project [YOUR_PROJECT_ID] --action_package ./action.json
```

This replaces the step 3 "Click Simulator under TEST" in the google assistant manual setup. Also seems to work longer than 3 days without re-deploying.

## Built With

* [Firebase](https://firebase.google.com/) - Used for hosting the pages and function

## Contributing

Please contact me if you have ideas/fixes/suggestions.

## Versioning

We use [Git](https://git-scm.com/) for versioning.

## Authors

* **Edinardo Potrich** - *Initial work* - [LinkedIn](https://www.linkedin.com/in/edinardopotrich/)


## License

This project is licensed under the GNU General Public License v3.0 or later - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Thanks to the [Demo Day!](http://developers.vegas/) team where the project was showed for the first time.