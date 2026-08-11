import * as React from "react";

/**
 * Keyboard activation for elements given role="button" / role="link".
 * Enter and Space activate; every other key falls through so Tab, arrows,
 * and browser shortcuts keep working.
 */
export function handleActivationKey(event: React.KeyboardEvent, action: () => void): void {
  // Keypresses other then Enter and Space should not trigger a command
  if (event.key !== "Enter" && event.key !== " ") {
    return; // Tab and all other keys: do nothing, let the browser handle naturally
  }
  event.preventDefault();
  action();
}
