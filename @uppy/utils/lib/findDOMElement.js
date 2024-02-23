import isDOMElement from "./isDOMElement.js";
export default function findDOMElement(element, context) {
  if (context === void 0) {
    context = document;
  }
  if (typeof element === 'string') {
    // @ts-expect-error ????
    return context.querySelector(element);
  }
  if (isDOMElement(element)) {
    // @ts-expect-error ????
    return element;
  }

  // @ts-expect-error ????
  return null;
}