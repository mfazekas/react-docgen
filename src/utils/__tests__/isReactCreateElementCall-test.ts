import { parse, makeMockImporter } from '../../../tests/utils';
import isReactCreateElementCall from '../isReactCreateElementCall';

describe('isReactCreateElementCall', () => {
  const mockImporter = makeMockImporter({
    foo: stmtLast =>
      stmtLast(`
      import React from 'react';
      export default React.createElement;
    `).get('declaration'),
  });

  describe('built in React.createElement', () => {
    it('accepts createElement called on React', () => {
      const def = parse.expressionLast(`
        var React = require("React");
        React.createElement({
          render() {}
        });
      `);

      expect(isReactCreateElementCall(def)).toBe(true);
    });

    it('accepts createElement called on aliased React', () => {
      const def = parse.expressionLast(`
        var other = require("React");
        other.createElement({
          render() {}
        });
      `);

      expect(isReactCreateElementCall(def)).toBe(true);
    });

    it('ignores other React calls', () => {
      const def = parse.expressionLast(`
        var React = require("React");
        React.isValidElement({});
      `);

      expect(isReactCreateElementCall(def)).toBe(false);
    });

    it('ignores non React calls to createElement', () => {
      const def = parse.expressionLast(`
        var React = require("bob");
        React.createElement({
          render() {}
        });
      `);

      expect(isReactCreateElementCall(def)).toBe(false);
    });

    it('accepts createElement called on destructed value', () => {
      const def = parse.expressionLast(`
        var { createElement } = require("react");
        createElement({});
      `);

      expect(isReactCreateElementCall(def)).toBe(true);
    });

    it('accepts createElement called on destructed aliased value', () => {
      const def = parse.expressionLast(`
        var { createElement: foo } = require("react");
        foo({});
      `);

      expect(isReactCreateElementCall(def)).toBe(true);
    });

    it('accepts createElement called on imported value', () => {
      const def = parse.expressionLast(`
        import { createElement } from "react";
        createElement({});
      `);

      expect(isReactCreateElementCall(def)).toBe(true);
    });

    it('accepts createElement called on imported aliased value', () => {
      const def = parse.expressionLast(`
        import { createElement as foo } from "react";
        foo({});
      `);

      expect(isReactCreateElementCall(def)).toBe(true);
    });

    it('can resolve createElement imported from an intermediate module', () => {
      const def = parse.expressionLast(
        `import foo from "foo";
         foo({});`,
        mockImporter,
      );

      expect(isReactCreateElementCall(def)).toBe(true);
    });
  });
});
