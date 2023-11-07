# UserCredits

UserCredits is an open-source library designed to simplify the implementation of pay-as-you-go features in your web or mobile applications. Whether you're building a subscription-based service, a digital marketplace, or an e-commerce platform, UserCredits provides a flexible and technology-agnostic solution to manage user credits and token-based payments.

## Getting started guide
To understand how offers are declared, orders executed and payments tracked a fully explained guide is available:
 - 1/ [Offers explained](/docs/offers_explained.md)
 - 2/ [Offer loading explained](/docs/offer_loading_explained.md)
 - 3/ [Orders Explained](/docs/orders_explained.md)

## What is it
 - [Features](#Features)
 - [Architecture](#Architecture)
   - [1. Declarative Interfaces](#1-declarative-interfaces)
   - [2. Technology-Agnostic Logic](2-technology-agnostic-logic)
   - [3. Implementation Layer](#3-implementation-layer)
     - [Database Abstraction](#database-abstraction)
     - [Payment Platform Integration](#payment-platform-integration)
 - [Using UserCredits](#using-usercredits)
   - [IService Interface](#iservice-interface)
   - [IPaymentClient Interface](#ipaymentclient-interface)
 - [Testing](#testing)
 - [IOC](#IOC)
 - [Contributing](#Contributing)
 - [License](#License)

## Features

- **Token Abstraction:** UserCredits introduces the concept of tokens, which abstracts real-world currency to provide flexibility in pricing models. Users can purchase tokens that can be used to pay for services, products, or subscriptions.

  - **Real-Time Credit Tracking:** Keep track of your users' token balances and consumption in real time. Users can easily view their credit history and remaining tokens.

  - **Payment Integration:** UserCredits is designed to integrate seamlessly with popular payment gateways, starting with Stripe. Accept payments from your users for token purchases or services rendered.

  - **Flexible Offers and Subscriptions:** Customize your pricing, discounts, and subscription durations for different offers using the `offer.overridingKey` and `weight` options. These features allow you to create tailored subscription plans, making it easier for users to enjoy lower prices on related offers.

  - **Offer Group Logic:** With the `offer.offerGroup` feature, users can subscribe to multiple offers and services simultaneously while keeping each offer's token balance separated from the others. Conceptually related offers can share the same `offerGroup` value, allowing you to compute the expiry date accordingly. For example, offers in the group 'mobileTV' can offer weekly, monthly, and yearly subscriptions. If a user subscribes for a month and later opts for a yearly subscription while the month hasn't ended, the expiry date of the subscription will combine both durations, providing a seamless and flexible experience.

  - **Multi-Currency Support:** Easily display orders and prices in multiple currencies to accommodate a global audience. While currency conversion is not built-in, UserCredits offers seamless integration to sync and manage international payments effortlessly.

## Architecture

UserCredits is designed with a modular architecture that simplifies development by abstracting the complexities of both database interactions and payment processing libraries. The architecture consists of distinct layers, each with its unique role:

### 1. Declarative Interfaces
At the core of UserCredits, you'll find a set of declarative interfaces that define the project's concepts and abstractions.

### 2. Technology-Agnostic Logic
The next layer implements technology-agnostic logic, providing methods for creating orders, managing special offers based on user subscriptions, and handling various payment-related operations and monitoring.

### 3. Implementation Layer
Each of these layers can be changed without any adaptations needed on the other:

  - #### Database Abstraction:
    Beneath the technology-agnostic logic, a database implementation is in place, currently using Mongoose and MongoDB. Importantly, adding support for other databases is straightforward. You can create Data Access Objects (DAOs) and schemas that adhere to the abstract concepts defined in the first layer. These implementations are utilized by the second layer, which remains unaware of the underlying database specifics.

  - #### Payment Platform Integration:
    The final layer serves as a bridge to payment platforms like Stripe. It encapsulates the intricacies of payment operations, allowing UserCredits to seamlessly interact with different payment providers.

> All these layers are efficiently managed through [Inversion of Control (IoC)](#ioc) principles, leveraging the Awilix library. The end result is a user-friendly and adaptable library that abstracts away the complexities of database and payment integration.

**UserCredits provides developers with a single, unified facade interface, simplifying their interactions with the library and shielding them from intricate implementation details. This design encourages easy adaptation to various projects and technologies.**

# Get Started

To start using UserCredits in your project, follow the installation and usage instructions in the [blog series](https://dev.to/zhamdi/architecting-pay-as-you-go-magic-usercredits-winning-formula-4ace).


# Using UserCredits

UserCredits provides two key interfaces to manage payments, subscriptions, and credits in your application: `IService` and `IPaymentClient`. These interfaces are designed to simplify the integration of payment processing and user credit management while remaining framework-agnostic.

## IService Interface

The `IService` interface is your entry point to user credit management and offer handling. It abstracts complex operations for user-specific offers and subscriptions. To use it, follow these steps:

### 1. Create an Instance

Instantiate the `Service` class, passing in the necessary dependencies:

```javascript
const service = new Service(daoFactory, defaultCurrency);
```

### 2. Load User Offers

Load user-specific offers, applying overriding logic for suboffers:

```javascript
const offers = await service.loadOffers(userId);
```

### 3. Create an Order

Create an order for a user to purchase an offer:

```javascript
const order = await service.createOrder(offerId, userId);
```

### 4. Check Subscription Status

Check if a user is already subscribed to a specific offer:

```javascript
const existingSubscription = await service.isUserAlreadySubscribed(userId, offerId);
```

### 5. Get User Credits

Retrieve user credits for a given user. User credits represent a list of credits grouped by offerGroup, allowing users to consume credits within each group independently of others. Each offerGroup contains activated offers with their respective start and expiry dates, along with the associated tokens.

```javascript
const userCredits = await service.getUserCredits(userId);
```

## IPaymentClient Interface

The `IPaymentClient` interface abstracts payment processing operations. It allows you to integrate payment gateways seamlessly without locking your application to a specific technology. To use it, follow these steps:

### 1. Create an Instance

Instantiate a class implementing the `IPaymentClient` interface, providing the required configurations:

```javascript
const paymentClient = new MyPaymentClient(config);
```

### 2. Execute Payment

Execute a payment and handle the payment execution status:

```javascript
const updatedOrder = await paymentClient.afterPaymentExecuted(order);
```

### 3. Check User Balance

Check a user's balance before processing payments:

```javascript
const balance = await paymentClient.checkUserBalance(userId);
```

### 4. Create Payment Intent

Create a payment intent to handle transactions:

```javascript
const paymentIntent = await paymentClient.createPaymentIntent(order);
```

### 5. Handle Webhooks

Handle payment-related webhooks securely:

```javascript
paymentClient.handleWebhook(eventPayload, webhookSecret);
```

By leveraging the `IService` and `IPaymentClient` interfaces, you can seamlessly manage user credits, subscriptions, and payments in your application while remaining flexible and adaptable to various technologies.


## Testing
We are using the project mongodb-memory-server to run an in memory mongodb for tests. Which generates the following warning

`(node:36336) ExperimentalWarning: VM Modules is an experimental feature and might change at any time`

### Prerequisites
Jest must be launched with the node option `--experimental-vm-modules` also to enable ecma6 syntax in config files
#### From the console:
here's an example of how to add that param from console:
`node --experimental-vm-modules node_modules/jest/bin/jest.js test/db/dao/IOfferDao.test.ts --testNamePattern="it() test name"
`
Or `node --experimental-vm-modules node_modules/jest/bin/jest.js`

### IOC
Because of parallel processes to access mongodb in Jest, we were obliged to create multiple simultaneous in memory mongodb instances to avoid inconsistencies in saved data between different tests.
Therefore, we enabled multiple simultaneous connections to mongodb through mongoose as described in https://mongoosejs.com/docs/connections.html#multiple_connections.
To adapt to that constraint, TestContainerSingleton.getInstance() now accepts a singleton:boolean parameter to tell it if it has to be a singleton or a prototype (on false value). See the file testContainer.ts for reference

## Contributing

UserCredits is an open-source project, and we welcome contributions from the community. Whether you want to add new features, improve documentation, or report issues, your help is valuable. Feel free to [contact me](https://twitter.com/zhamdi) or to fork the project.

## License

UserCredits is released under the [MIT License](https://github.com/ziedHamdi/UserCredits/blob/master/LICENSE). Feel free to use it in your projects, commercial or otherwise.

---

[![GitHub stars](https://img.shields.io/github/stars/ziedHamdi/UserCredits?style=social)](https://github.com/ziedHamdi/UserCredits/stargazers)
