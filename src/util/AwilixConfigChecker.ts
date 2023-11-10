import { AwilixContainer } from "awilix";

/**
 * A utility method to verify that IOC prerequisites are fulfilled. This is only a surface test, it (still) doesn't check
 * if you defined a function as a singleton for example, or doesn't verify the validity of the signature of a function
 * or the type of a value.
 * @param container your Awilix initialized container
 * @param expectedProperties check Constants.EXPECTED_PROPERTIES for the list of needed props to run the project
 */
export function checkContainer(
  container: AwilixContainer<object>,
  expectedProperties: Record<string, "Value" | "Function">,
): boolean {
  // Check if all expected properties are registered in the container
  for (const propertyName of Object.keys(expectedProperties)) {
    // const propertyType = expectedProperties[propertyName];
    const registration = container.registrations[propertyName];

    if (!registration) {
      console.error(`Missing registration for property: ${propertyName}`);
      return false;
    }
    //
    // if (propertyType === "Function" && !registration.factories.length) {
    //   console.error(
    //     `Expected a function registration for property: ${propertyName}`
    //   );
    //   return false;
    // }

    // if (propertyType === "Value" && !registration.values.length) {
    //   console.error(
    //     `Expected a value registration for property: ${propertyName}`
    //   );
    //   return false;
    // }
  }

  // If all checks pass, return true
  return true;
}
