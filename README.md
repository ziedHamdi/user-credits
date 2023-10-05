# UserCredits

UserCredits is an open-source library designed to simplify the implementation of pay-as-you-go features in your web or mobile applications. Whether you're building a subscription-based service, a digital marketplace, or an e-commerce platform, UserCredits provides a flexible and technology-agnostic solution to manage user credits and token-based payments.

## Features

- **Token Abstraction:** UserCredits introduces the concept of tokens, which abstracts real-world currency to provide flexibility in pricing models. Users can purchase tokens that can be used to pay for services, products, or subscriptions.

- **Real-Time Credit Tracking:** Keep track of your users' token balances and consumption in real time. Users can easily view their credit history and remaining tokens.

- **Payment Integration:** UserCredits is designed to integrate seamlessly with popular payment gateways, starting with Stripe. Accept payments from your users for token purchases or services rendered.

- **Flexible Offers and Subscriptions:** Define a wide range of offers and subscription plans tailored to your business needs. Customize pricing, discounts, and subscription durations.

- **Multi-Currency Support:** Display offers and prices in multiple currencies to cater to a global audience. Currency conversion is built-in, making it easy to handle international payments.

## Architecture

UserCredits is built with a modular architecture that separates core business logic from database implementations. Key architectural components include:

- **DAO Factory:** The Data Access Object (DAO) Factory abstracts database interactions, allowing you to switch between database technologies without changing the core logic of your application.

- **Service Layer:** UserCredits provides a flexible service layer that acts as a facade for pay-as-you-go features. It abstracts complex operations, making it easy to create orders, execute payments, and check token balances.

- **Inversion of Control (IoC):** IoC, implemented through the Awilix library, manages dependencies and injects the appropriate DAOs into your service and other components. This allows for easy adaptation to various projects and technologies.

## Get Started

To start using UserCredits in your project, follow the installation and usage instructions in the [blog series](https://dev.to/zhamdi/architecting-pay-as-you-go-magic-usercredits-winning-formula-4ace).

## Testing
We are using the project mongodb-memory-server to run an in memory mongodb for tests. Which generates the following warning

`(node:36336) ExperimentalWarning: VM Modules is an experimental feature and might change at any time`
### Prerequisites
Jest must be launched with the node option `--experimental-vm-modules` also to enable ecma6 syntax in config files

## Contributing

UserCredits is an open-source project, and we welcome contributions from the community. Whether you want to add new features, improve documentation, or report issues, your help is valuable. Feel free to [contact me](https://twitter.com/zhamdi) or to fork the project.

## License

UserCredits is released under the [MIT License](#). Feel free to use it in your projects, commercial or otherwise.

---

[![GitHub stars](https://img.shields.io/github/stars/ziedHamdi/UserCredits?style=social)](https://github.com/ziedHamdi/UserCredits/stargazers)
