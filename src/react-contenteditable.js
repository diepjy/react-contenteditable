import React from 'react';

let stripNbsp = str => str.replace(/&nbsp;|\u202F|\u00A0/g, ' ');

export default class ContentEditable extends React.Component {
  constructor(props) {
    super(props);
    this.html = '';
    this.isActive = false;
    this.emitChange = this.emitChange.bind(this);
  }

  render() {
    var { tagName, html, placeholder, ...props } = this.props;

    if (placeholder !== undefined && html.trim().length <= 0 && !this.active) {
      this.html = placeholder;
    } else {
      this.html = html;
    }

    return React.createElement(
      tagName || 'div',
      {
        ...props,
        ref: (e) => this.htmlEl = e,
        onInput: this.emitChange,
        onFocus: (e) => {
          this.active = true;
          if (placeholder !== undefined && this.htmlEl.innerHTML === placeholder) {
            this.html = html;
            this.htmlEl.innerHTML = '';
          }
        },
        onBlur: (e) => {
          this.active = false;
          if (this.htmlEl.innerHTML.length <= 0) {
            this.htmlEl.innerHTML = placeholder;
          }

          if (this.props.onBlur) {
            this.props.onBlur(e);
          } else {
            this.emitChange(e);
          }
        },
        // onBlur: this.props.onBlur || this.emitChange,
        contentEditable: !this.props.disabled,
        dangerouslySetInnerHTML: {__html: this.html}
      },
      this.props.children);
  }

  shouldComponentUpdate(nextProps) {
    let { props, htmlEl } = this;

    // We need not rerender if the change of props simply reflects the user's edits.
    // Rerendering in this case would make the cursor/caret jump

    // Rerender if there is no element yet... (somehow?)
    if (!htmlEl) {
      return true;
    }

    // ...or if html really changed... (programmatically, not by user edit)
    if (
      stripNbsp(nextProps.html) !== stripNbsp(htmlEl.innerHTML) &&
      nextProps.html !== props.html
    ) {
      return true;
    }

    let optional = ['style', 'className', 'disabled', 'tagName'];

    // Handle additional properties
    return optional.some(name => props[name] !== nextProps[name]);
  }

  componentDidUpdate() {
    if ( this.htmlEl && this.props.html !== this.htmlEl.innerHTML ) {
      // Perhaps React (whose VDOM gets outdated because we often prevent
      // rerendering) did not update the DOM. So we update it manually now.
      this.htmlEl.innerHTML = this.props.html;
    }
  }

  emitChange(evt) {
    if (!this.htmlEl) return;
    var html = this.htmlEl.innerHTML;
    if (this.props.onChange && html !== this.lastHtml) {
      // Clone event with Object.assign to avoid 
      // "Cannot assign to read only property 'target' of object"
      var evt = Object.assign({}, evt, { 
        target: { 
          value: html 
        } 
      });
      this.props.onChange(evt);
    }
    this.lastHtml = html;
  }
}
