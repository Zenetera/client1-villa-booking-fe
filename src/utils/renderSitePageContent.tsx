import type { ReactNode } from 'react';

interface ParsedBlock {
  type: 'paragraph' | 'list';
  lines: string[];
}

interface ParsedSection {
  heading: string | null;
  blocks: ParsedBlock[];
}

function parseSection(section: string): ParsedSection {
  const paragraphs = section.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) {
    return { heading: null, blocks: [] };
  }

  const first = paragraphs[0];
  const firstIsSingleLine = !first.includes('\n') && !first.startsWith('\u2022 ');
  const heading = firstIsSingleLine ? first : null;
  const bodyParagraphs = firstIsSingleLine ? paragraphs.slice(1) : paragraphs;

  const blocks: ParsedBlock[] = bodyParagraphs.map((p) => {
    const lines = p.split('\n').map((l) => l.trim()).filter(Boolean);
    const allBullets = lines.length > 0 && lines.every((l) => l.startsWith('\u2022 '));
    if (allBullets) {
      return { type: 'list', lines: lines.map((l) => l.slice(2).trim()) };
    }
    return { type: 'paragraph', lines };
  });

  return { heading, blocks };
}

export function renderSitePageContent(content: string): ReactNode[] {
  const sections = content
    .split(/\n{3,}/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(parseSection);

  return sections.map((section, sIdx) => (
    <section key={sIdx}>
      {section.heading && <h2>{section.heading}</h2>}
      {section.blocks.map((block, bIdx) => {
        if (block.type === 'list') {
          return (
            <ul key={bIdx}>
              {block.lines.map((item, iIdx) => (
                <li key={iIdx}>{item}</li>
              ))}
            </ul>
          );
        }
        return <p key={bIdx}>{block.lines.join(' ')}</p>;
      })}
    </section>
  ));
}
