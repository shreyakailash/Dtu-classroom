import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const lines = content.split('\n');
    // Fix: Use React.ReactElement instead of JSX.Element to avoid namespace issues.
    const elements: React.ReactElement[] = [];
    let listBuffer: string[] = [];

    const flushListBuffer = (key: string) => {
        if (listBuffer.length > 0) {
            elements.push(
                <ul key={key} className="list-disc list-inside space-y-1 my-2 pl-2">
                    {listBuffer.map((item, index) => {
                        const formattedItem = { __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>') };
                        return <li key={`${key}-${index}`} dangerouslySetInnerHTML={formattedItem} />;
                    })}
                </ul>
            );
            listBuffer = [];
        }
    };

    lines.forEach((line, index) => {
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            listBuffer.push(line.trim().substring(2));
        } else {
            flushListBuffer(`list-${index}`);
            if (line.trim()) {
                const formattedLine = { __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>') };
                elements.push(<p key={`p-${index}`} className="my-1" dangerouslySetInnerHTML={formattedLine} />);
            }
        }
    });

    flushListBuffer('list-final');

    return <>{elements}</>;
};

export default MarkdownRenderer;
