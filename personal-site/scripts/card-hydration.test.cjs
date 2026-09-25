const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const source = readFileSync(join(__dirname, '../app/card/flip-card.tsx'), 'utf8');
const code = ts.transpileModule(source, {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    esModuleInterop: true,
  },
}).outputText;

function renderWithMath(roundingError) {
  const runtimeMath = Object.create(Math);
  for (const fn of ['sin', 'cos']) {
    runtimeMath[fn] = (value) => Math[fn](value) + roundingError;
  }
  const moduleExports = {};
  vm.runInNewContext(code, {
    exports: moduleExports,
    Math: runtimeMath,
    require(name) {
      if (name === 'react' || name === 'react/jsx-runtime') return require(name);
      // Keep the actual card and its styles; isolate unrelated Next components.
      if (name === 'next/image') return ({ priority, ...props }) => React.createElement('img', props);
      if (name === 'next/link') return (props) => React.createElement('a', props);
      if (name === './card-icon') return { CardIcon: () => null };
      if (name === './share-profile') return { ShareProfile: () => null };
      if (name.endsWith('.module.css')) {
        return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
      }
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return renderToStaticMarkup(React.createElement(moduleExports.FlipCard));
}

test('card initial markup is stable across floating-point differences between JS engines', () => {
  const baseline = renderWithMath(0);
  assert.match(baseline, /0\.956940/);
  for (const error of [Number.EPSILON, -Number.EPSILON]) {
    assert.equal(renderWithMath(error), baseline);
  }
});
