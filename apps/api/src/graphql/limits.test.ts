import { describe, it, expect } from 'vitest';
import { buildSchema, parse, validate } from 'graphql';
import { operationLimits } from './limits.js';
const schema = buildSchema('type Item { child: Item, name: String } type Query { item: Item }');
const errors = (query: string) => validate(schema, parse(query), [operationLimits]);
describe('GraphQL query limits', () => {
  it('accepts normal queries', () => expect(errors('{ item { name } }')).toHaveLength(0));
  it('rejects excessive nesting', () =>
    expect(
      errors(
        '{ item { child { child { child { child { child { child { child { child { name } } } } } } } } } }',
      ),
    ).toHaveLength(1));
  it('counts repeated fragment expansions', () => {
    const fields = Array.from({ length: 76 }, (_, i) => `n${i}:name`).join(' ');
    expect(
      errors(`{ a:item { ...F } b:item { ...F } } fragment F on Item { ${fields} }`),
    ).toHaveLength(1);
  });
});
