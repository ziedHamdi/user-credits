[Next > offer loading explained](/docs/offer_loading_explained.md)

# Welcome to the Offer Guide Case Study

In this guide, we'll explore how to create a compelling subscription offer ecosystem for your business. Imagine you're at the helm of a startup, let's call it WonderAI, and you're looking to attract your first customers, including early adopters. Your goal is to entice them with a set of enticing offers that not only make sense but also deliver real value.

## Crafting the Perfect Offers

WonderAI has three primary types of offers: "Startup," "Business," and "ScaleUp." These offers cater to different stages of a customer's journey, from startups taking their first steps to well-established businesses and fast-growing companies on the path to internationalization.

- **Startup**: Designed for budding entrepreneurs and startups looking to get their feet wet in the world of AI.
- **Business**: Tailored for established startups that have found their footing and are ready to take their AI ventures to the next level.
- **ScaleUp**: The top-tier subscription, reserved for rapidly growing startups looking to make a global impact.

## Attracting Early Birds

To stand out in the competitive landscape and attract early adopters, or what we like to call "Early Birds," WonderAI is not only offering its core subscriptions at competitive prices but also unlocking exclusive VIP offers. The VIP offers, like the ability to publish articles about the customer's company on the WonderAI website and speak at WonderAI conferences, add a premium touch to the subscriptions.

What's unique here is that these VIP offers aren't limited to just the "ScaleUp" subscription. WonderAI is taking a customer-centric approach by extending VIP access to "Startup" and "Business" subscribers as well. This approach creates a win-win situation where customers at different stages can access premium features.

In this guide, we'll dive deeper into how to structure your subscription offers, manage the different fields in the interface, and leverage utility methods in our library. Let's get started on crafting the perfect subscription offer ecosystem for your business.

## Monthly vs. yearly payments
WonderAI, much like its startup counterparts, wants to offer its users the flexibility to pay on a monthly or yearly basis, with the added benefit of cost savings for annual subscriptions (for instance, getting two months free with a yearly subscription). So, our three primary offers, "Startup," "Business," and "ScaleUp," come in four different flavors: "EarlyBird" (offering both monthly and yearly options) and "Standard" (with monthly and yearly plans).

> Like many startups, WonderAI provides a range of subscription offers, but let's focus on the core concepts for now. We'll delve into adding free trials and basic services towards the end of this article once we've got a solid grasp of these fundamental principles.

# Offer groups
Now, here's where things get interesting, and it might not be immediately apparent to users, but it's crucial for us when writing the code for these offers. Imagine a scenario where a "Standard" subscriber initially opts for three months of the "Startup" offer and later decides to upgrade to a one-year "Startup" subscription. In this case, the expiry date for that annual subscription must build upon the existing three months they've already purchased. However, if the user is still within the initial three months of the "Startup" subscription and decides to purchase a "Business" offer, these purchases must be handled separately. This doesn't just pertain to triggering a refund for the remaining "Startup" subscription; it's about managing the "Startup" subscriptions for yearly and monthly plans in a way that they are somehow interconnected. We call this grouping of offers an 'offer group.'
#### What to include?
Now, let's talk about the Early Bird subscriptions. These can be enticing lifetime offers, but they may also have a time limit, such as 'get 50% off for three years.' Depending on the developer's choice, the Early Bird offers may or may not belong to the same 'offer group' as their 'Standard' counterparts. This decision provides flexibility and control in how these offers are managed.

## Token Management

As we dive deeper into the world of subscription offers, it becomes evident that '**Offer Groups**' serve as a fundamental framework for managing the intricacies of subscription services, particularly in the context of AI and SaaS companies. These businesses often offer **pay-as-you-go** models where users purchase a predefined set of credits or **tokens**, each representing a unit of service consumption, much like buying tickets at an amusement park.

Consider the scenario at WonderAI, where they provide customers the opportunity to book conference speaker talks (talking about their company at the same time). A user may choose to purchase a single talk for 1000$, represented as **1 token**, or opt for a bundle of three talks at 2000$, denoted as **3 tokens**. The versatility of this system allows customers to not only buy multiple instances of a one-token offer but also combine various token packages. In such cases, it is essential that these token offers are **grouped together**, which brings us back to the concept of **Offer Groups**.

> If for instance, a '**Startup**' customer that has 2 tokens remaining in their credits decides to upgrade to the '**Business**' plan, subsequently purchasing an additional token. The question arises: 
> _should all these tokens fall under the same basket, or should they remain separate?_ The answer, as you might have guessed, is: **it depends**. In practice, it's often more efficient to keep each '**token**' offer within its respective **"offer group order"** and to search for available **tokens** across all active subscriptions. This approach offers a more flexible and organized way to manage token-based services while ensuring that **tokens** with closer **expiry dates** are prioritized. We start to see the reason why a dedicated library to manage all this could save us time and pain.

### Takeaways about offer groups 
In the evolving landscape of subscription offerings, comprehending the role of '**Offer Groups**' empowers businesses to construct tailored subscription models that align with their unique strategies and user experiences. This level of customization not only simplifies subscription management but also enriches the user's journey, making it a win-win-win situation for developers, companies and customers.

# Functional Tags

In our intricate world of subscription offers, where concepts like **Offer Groups**, **Tokens**, and **Startup Offers** play pivotal roles, another crucial element comes into play: **Functional Tags**. These are not your typical tags visible to users but rather have a specific function, guiding the system's behavior.

> So far, we've laid the foundation with six **Offer Groups**, thoughtfully organized as two sets of three: "**Startup**," "**Business**," and "**ScaleUp**" offers groups for each of "**Standard**" and "**Early Bird**", and each housing both **monthly** and **yearly** subscription options. So a total of twelve basic offers. As you can see, the complexity is growing.

Now, let's tackle the challenge of displaying the right offers to our users. We don't want to overwhelm them with all options at once, and we need to differentiate between "**Early Bird**" and "**Standard**" offers based on the user's status, perhaps through an invitation link or a specific **_end of happy days date_**. Moreover, displaying both **monthly** and **yearly** subscriptions simultaneously may not be ideal. Users usually prefer a clean interface with a switch to toggle between subscription durations, with a message highlighting the yearly subscription's advantages, such as "two months free".

Functional **Tags** come to the rescue here. We can begin by tagging all our subscription offers with the label "**subscription**". This sets them apart from other types of **offers**. Now, remember, we haven't even delved into the exclusive **VIP** offers yet, available only to "**ScaleUp**" subscribers in the "**Standard**" scenario but accessible to all "**Early Bird**" subscribers. These six core offers can all bear the "**subscription**" tag, distinguishing them.

However, we still have 12 offers to manage, and we need to further categorize them. Six can be marked with the "**monthly**" tag, while the remaining six get tagged as "**yearly**," indicating yearly subscriptions. This results in two sets of six offers each. To refine the selection, we add the tags "**Standard**" and "**Early Bird**," creating four distinct combinations: "Standard Monthly," "Early Bird Monthly," "Standard Yearly," and "Early Bird Yearly."

### Takeaways about Tags
Now, the user environment, influenced by their status, will determine whether to display "**Early Bird**" or "**Standard" offers**. Then, the switch on the display page lets users toggle between "**Monthly**" and "**Yearly**" subscriptions. The power of **Functional Tags** lies in their role as filters, streamlining the offers presented to users. They don't carry hidden functionalities like **Offer Groups**, which influence expiry dates and token counts, making them a valuable tool for effective offer presentation.

> In the complex world of subscription offers, maintaining a streamlined and efficient system is essential. That's where a dedicated library for handling various aspects of offers, like **Functional Tags**, proves invaluable.


Now, let's dive into a more intricate topic: **Offer Unlocking**.

# Unleashing Exclusive VIP Offers

Unlocking **VIP** offers for "**Standard-ScaleUp**" subscribers may appear straightforward at first glance. We could declare an offer as the child of the "**Standard**" or "**ScaleUp**" subscription, ensuring that only customers who subscribe to these offers can access the child VIP service. However, there's a catch. We have not one but two types of "**Standard**" and "**ScaleUp**" offers: **monthly** and **yearly** subscriptions. The challenge is to make our VIP offer accessible to both without creating duplicate child offers.

### Offer Group Sub-Offers
The good news is that we've already introduced the concept of **Offer Groups** for "**ScaleUp**" subscribers. To address the differentiation between "**Standard**" and "**Early Bird**" customers, we must name these **Offer Groups** differently, for example **Startup** and **EbStartup**. This will solve our conflict.

### Groups of Offer Groups Sub-Offers

Now, let's shift our focus to the "**Early Bird**" offer groups, which **all** unlock the **VIP** offers. We're dealing with a new situation that is actually a **group of Offer Groups**! Fortunately, similar to Functional Tags, we can assign multiple values to **Offer Group**s. This means that we can designate the three groups "**EbStartup**," "**EbBusiness**," and "**EbScaleUp**" as part of a broader group named "**Early Bird**" Within this context, we can add a child offer to the "**Early Bird**" group, offering the **VIP** services, simplifying our management.

> It's crucial to clarify a concept here – when we mention adding "Early Bird" to the "Startup" offer group, it's a conceptual representation. In practical terms, it involves assigning the "Early Bird" label to the `offerGroup` field for each offer within the "Startup", "Business" and "ScaleUp" groups. This duplication of information within the library's concrete implementation is a choice to enhance performance by keeping the related information in the same place for fast reading.

## Completing With Free Subscriptions

Now, let's discuss how to incorporate a free subscription offer into the mix. This is a strategic move for WonderAI to gather user emails and connect with them through compelling irresistible offers.

The free subscription offer comes with three essential tags: "subscription," "monthly," and "yearly." If the perks for early adopters align with those of "standard" customers, it's possible to include a fourth tag, "earlybird." This tag ensures that you can locate the free subscription offer in any query that searches for root offers. However, for better organization as your customer base grows, it's recommended to create a separate offer exclusively for "Early Birds." This approach facilitates easy management and access, particularly as your customer numbers increase, which is something I wish for you now that you know how to serve them well.

[Next > offer loading explained](/docs/offer_loading_explained.md)
