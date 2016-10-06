# CloudCo Insurance - Orders

| **master** | [![Build Status](https://travis-ci.org/IBM-Bluemix/insurance-orders.svg?branch=master)](https://travis-ci.org/IBM-Bluemix/insurance-orders) |
| ----- | ----- |
| **dev** | [![Build Status](https://travis-ci.org/IBM-Bluemix/insurance-orders.svg?branch=dev)](https://travis-ci.org/IBM-Bluemix/insurance-orders) |

This service is part of the larger [CloudCo Insurance](https://github.com/IBM-Bluemix/cloudco-insurance) project.

# Overview

A Node.js app that serves as an API into the orders database for the [CloudCo Insurance](https://github.com/IBM-Bluemix/cloudco-insurance). To store the insurance policy orders, we use a [Cloudant NoSQL DB][cloudant_url].

In order to deploy the full set of microservices involved in the insurance-store demo, check out the [insurance-toolchain repo][toolchain_url]. Otherwise, you can deploy just the app by following the steps here.

## Running the app on Bluemix

1. If you do not already have a Bluemix account, [sign up here][bluemix_reg_url]

2. Download and install the [Cloud Foundry CLI][cloud_foundry_url] tool

3. Clone the app to your local environment from your terminal using the following command:

  ```
  git clone https://github.com/IBM-Bluemix/insurance-orders.git
  ```

4. `cd` into this newly created directory

5. Open the `manifest.yml` file and change the `host` value to something unique.

  The host you choose will determinate the subdomain of your application's URL:  `<host>.mybluemix.net`

6. Connect to Bluemix in the command line tool and follow the prompts to log in

  ```
  $ cf login -a https://api.ng.bluemix.net
  ```

7. Create the [Cloudant service][cloudant_service_url] in Bluemix

  ```
  $ cf create-service cloudantNoSQLDB Shared policy-db
  ```

8. Push the app to Bluemix

  ```
  $ cf push --no-start
  ```

9. Bind the Cloudant service to your app

  ```
  $ cf bind-service insurance-orders policy-db
  ```

1. Define a variable pointing to the Catalog API deployment.

  ```
  cf set-env insurance-orders CATALOG_URL https://your-catalog-api-server.mybluemix.net
  ```

1. Start your app

  ```
  $ cf start insurance-orders
  ```

And voila! You now have your very own instance of the Insurance Orders API running on Bluemix.

## Run the app locally

1. If you do not already have a Bluemix account, [sign up here][bluemix_reg_url]

2. If you have not already, [download Node.js][download_node_url] and install it on your local machine.

3. Clone the app to your local environment from your terminal using the following command:

  ```
  git clone https://github.com/IBM-Bluemix/insurance-orders.git
  ```

4. `cd` into this newly created directory

5. Create a [Cloudant service][cloudant_service_url] named `policy-db` using your Bluemix account and replace the corresponding credentials in your `vcap-local.json` file

1. In the checkout directory, copy the file ```.template.env``` to ```.env```. Edit ```.env``` and update the location of the Catalog API.

  ```
  cp .template.env .env
  ```

6. Install the required npm packages using the following command

  ```
  npm install
  ```

7. Start your app locally with the following command

  ```
  npm start
  ```

This command will start your Node.js web server and print the address where it is listening to requests in the console: `server starting on http://localhost:6037`.

## Contribute
If you find a bug, please report it via the [Issues section][issues_url] or even better, fork the project and submit a pull request with your fix! We are more than happy to accept external contributions to this project if they address something noted in an existing issue.  In order to be considered, pull requests must pass the initial [Travis CI][travis_url] build and/or add substantial value to the sample application.

## Troubleshooting

The primary source of debugging information for your Bluemix app is the logs. To see them, run the following command using the Cloud Foundry CLI:

  ```
  $ cf logs insurance-orders --recent
  ```
For more detailed information on troubleshooting your application, see the [Troubleshooting section](https://www.ng.bluemix.net/docs/troubleshoot/tr.html) in the Bluemix documentation.

## License

See [License.txt](License.txt) for license information.

<!--Links-->
[toolchain_url]: https://github.com/IBM-Bluemix/insurance-toolchain
[bluemix_reg_url]: http://ibm.biz/insurance-store-registration
[cloud_foundry_url]: https://github.com/cloudfoundry/cli
[cloudant_url]: https://cloudant.com/
[cloudant_service_url]: https://new-console.ng.bluemix.net/catalog/services/cloudant-nosql-db/
[download_node_url]: https://nodejs.org/download/
[issues_url]: https://github.com/ibm-bluemix/insurance-orders/issues
[travis_url]: https://travis-ci.org/
