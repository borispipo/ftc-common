import isDOMElement from "$cutils/dom/isDOMElement";
import {defaultStr} from "$cutils";
/**
 * Traverse any props.children to get their combined text content.
 *
 * This does not add whitespace for readability: `<p>Hello <em>world</em>!</p>`
 * yields `Hello world!` as expected, but `<p>Hello</p><p>world</p>` returns
 * `Helloworld`, just like https://mdn.io/Node/textContent does.
 *
 * NOTE: This may be very dependent on the internals of React.
 */
export default function getTextContent (elem,childContentSeparator) {
    if (!elem) {
        return '';
    }
    if (typeof elem === 'string') {
        return elem;
    }
    if(isDOMElement(elem)){
        return defaultStr(elem.innerText, elem.textContent)
    }
    const children = elem.props && elem.props.children;
    childContentSeparator = defaultStr(childContentSeparator," ")
    if (children instanceof Array) {
        return children.map(getTextContent).join(childContentSeparator);
    }
    return getTextContent(children);
  }