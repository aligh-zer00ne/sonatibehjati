import {
  GraphQLError,
  Kind,
  type FragmentDefinitionNode,
  type SelectionSetNode,
  type ValidationRule,
} from 'graphql';
export const operationLimits: ValidationRule = (context) => ({
  Document(node) {
    const fragments = new Map<string, FragmentDefinitionNode>();
    for (const definition of node.definitions)
      if (definition.kind === Kind.FRAGMENT_DEFINITION)
        fragments.set(definition.name.value, definition);
    for (const definition of node.definitions) {
      if (definition.kind !== Kind.OPERATION_DEFINITION) continue;
      let fields = 0;
      function inspect(set: SelectionSetNode, depth: number, visited: Set<string>): boolean {
        if (depth > 8) return false;
        for (const selection of set.selections) {
          if (selection.kind === Kind.FIELD) {
            if (++fields > 150) return false;
            if (selection.selectionSet && !inspect(selection.selectionSet, depth + 1, visited))
              return false;
          } else if (selection.kind === Kind.INLINE_FRAGMENT) {
            if (!inspect(selection.selectionSet, depth, visited)) return false;
          } else {
            const name = selection.name.value;
            if (visited.has(name)) return false;
            const fragment = fragments.get(name);
            if (fragment && !inspect(fragment.selectionSet, depth, new Set([...visited, name])))
              return false;
          }
        }
        return true;
      }
      if (!inspect(definition.selectionSet, 1, new Set()))
        context.reportError(new GraphQLError('Query exceeds allowed depth or complexity.'));
    }
  },
});
