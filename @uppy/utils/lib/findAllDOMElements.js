import isDOMElement from "./isDOMElement.js";

/**
 * Find one or more DOM elements.
 */
export default function findAllDOMElements(element) {
  if (typeof element === 'string') {
    const elements = document.querySelectorAll(element);
    return elements.length === 0 ? null : Array.from(elements);
  }
  if (typeof element === 'object' && isDOMElement(element)) {
    return [element];
  }
  return null;
}