import { Box, Link as RLink, Text } from '@radix-ui/themes';
import { NavLink } from 'react-router';
import type * as PageTree from 'fumadocs-core/page-tree';

export function Sidebar({ tree }: { tree: PageTree.Root }) {
  return (
    <nav>
      <TreeNodes nodes={tree.children} depth={0} />
    </nav>
  );
}

function TreeNodes({ nodes, depth }: { nodes: PageTree.Node[]; depth: number }) {
  return (
    <Box asChild>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {nodes.map((node, i) => (
          <li key={i} style={{ marginLeft: depth === 0 ? 0 : '0.75rem' }}>
            <TreeNode node={node} depth={depth} />
          </li>
        ))}
      </ul>
    </Box>
  );
}

function TreeNode({ node, depth }: { node: PageTree.Node; depth: number }) {
  if (node.type === 'separator') {
    return (
      <Text size="1" weight="bold" color="gray" mt="3" mb="1" as="div">
        {flattenName(node.name)}
      </Text>
    );
  }

  if (node.type === 'folder') {
    return (
      <Box my="1">
        {node.index ? (
          <PageLink url={node.index.url} name={node.index.name} />
        ) : (
          <Text size="2" weight="medium" as="div" my="1">
            {flattenName(node.name)}
          </Text>
        )}
        {node.children.length > 0 && <TreeNodes nodes={node.children} depth={depth + 1} />}
      </Box>
    );
  }

  return <PageLink url={node.url} name={node.name} />;
}

function PageLink({ url, name }: { url: string; name: PageTree.Node['name'] }) {
  return (
    <RLink asChild size="2">
      <NavLink
        to={url}
        end
        style={({ isActive }) => ({
          display: 'block',
          padding: '0.25rem 0',
          color: isActive ? 'var(--accent-11)' : 'var(--gray-12)',
          fontWeight: isActive ? 600 : 400,
          textDecoration: 'none',
        })}
      >
        {flattenName(name)}
      </NavLink>
    </RLink>
  );
}

function flattenName(name: PageTree.Node['name']): string {
  if (typeof name === 'string') return name;
  // ReactNode fallback — render as-is when string coercion fails.
  return String(name ?? '');
}
