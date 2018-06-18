# Cloud Insurance Co. - Orders

| **master** | [![Build Status](https://travis-ci.org/IBM-Cloud/insurance-orders.svg?branch=master)](https://travis-ci.org/IBM-Cloud/insurance-orders) |
| ----- | ----- |
| **dev** | [![Build Status](https://travis-ci.org/IBM-Cloud/insurance-orders.svg?branch=dev)](https://travis-ci.org/IBM-Cloud/insurance-orders) |

This service is part of the larger [Cloud Insurance Co.](https://github.com/IBM-Cloud/cloudco-insurance) project.

# Overview

A Node.js app that serves as an API into the orders database for the [Cloud Insurance Co.](https://github.com/IBM-Cloud/cloudco-insurance). To store the insurance policy orders, we use a [Cloudant NoSQL DB][cloudant_url].

In order to deploy the full set of microservices involved, check out the [insurance-toolchain repo][toolchain_url]. Otherwise, you can deploy just the app by following the steps here.

## Running the app on IBM Cloud

1. If you do not already have an IBM Cloud account, [sign up here][bluemix_reg_url].

1. Download and install the [IBM Cloud CLI][ibmcloud_cli_url] tool.

1. The Orders microservice depends on the [Catalog microservice](https://github.com/IBM-Cloud/insurance-catalog). Make sure to deploy the Catalog first.

1. Clone the app to your local environment from your terminal using the following command:

  ```
  git clone https://github.com/IBM-Cloud/insurance-orders.git
  ```

1. `cd` into this newly created directory

1. Open the `manifest.yml` file and change the `host` value to something unique.

  The host you choose will determinate the subdomain of your application's URL:  `<host>.mybluemix.net`

1. Connect to IBM Cloud in the command line tool and follow the prompts to log in

  ```
  ibmcloud cf login -a https://api.ng.bluemix.net
  ```

1. Create the [Cloudant service][cloudant_service_url] in IBM Cloud:

  ```
  ibmcloud cf create-service cloudantNoSQLDB Lite insurance-policy-db
  ```

1. Push the app to IBM Cloud:

  ```
  ibmcloud cf push --no-start
  ```

1. Define a variable pointing to the Catalog API deployment.

  ```
  ibmcloud cf set-env insurance-orders CATALOG_URL https://your-insurance-catalog.mybluemix.net
  ```

1. Start your app:

  ```
  ibmcloud cf start insurance-orders
  ```

And voila! You now have your very own instance of the Insurance Orders API running on IBM Cloud.

## Run the app locally

1. If you do not already have an IBM Cloud account, [sign up here][bluemix_reg_url]

2. If you have not already, [download Node.js][download_node_url] and install it on your local machine.

1. The Orders microservice depends on the [Catalog microservice](https://github.com/IBM-Cloud/insurance-catalog). Make sure to deploy the Catalog first.

3. Clone the app to your local environment from your terminal using the following command:

  ```
  git clone https://github.com/IBM-Cloud/insurance-orders.git
  ```

4. `cd` into this newly created directory

5. Create a [Cloudant service][cloudant_service_url] named `insurance-policy-db` using your IBM Cloud account and replace the corresponding credentials in your `vcap-local.json` file - using `vcap-local.template.json` as template file.

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

The primary source of debugging information for your IBM Cloud app is the logs. To see them, run the following command using the Cloud Foundry CLI:

  ```
  $ ibmcloud cf logs insurance-orders --recent
  ```
For more detailed information on troubleshooting your application, see the [Troubleshooting section](https://console.bluemix.net/docs/troubleshoot/tr.html) in the IBM Cloud documentation.

## License

See [License.txt](License.txt) for license information.

<!--Links-->
[toolchain_url]: https://github.com/IBM-Cloud/insurance-toolchain
[bluemix_reg_url]: http://ibm.biz/insurance-store-registration
[ibmcloud_cli_url]: https://console.bluemix.net/docs/cli/reference/bluemix_cli/get_started.html#getting-started
[cloudant_url]: https://cloudant.com/
[cloudant_service_url]: https://console.bluemix.net/catalog/services/cloudant-nosql-db/
[download_node_url]: https://nodejs.org/download/
[issues_url]: https://github.com/ibm-Cloud/insurance-orders/issues
[travis_url]: https://travis-ci.org/
