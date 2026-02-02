import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface AIVetMessageProps {
  content: string;
}

interface Section {
  title: string;
  content: string;
  emoji: string;
}

function parseMessageIntoSections(content: string): Section[] {
  const sections: Section[] = [];
  
  // Split by ## headers
  const parts = content.split(/^## /gm).filter(Boolean);
  
  for (const part of parts) {
    const lines = part.split('\n');
    const titleLine = lines[0]?.trim() || '';
    const restContent = lines.slice(1).join('\n').trim();
    
    // Extract emoji from title
    const emojiMatch = titleLine.match(/^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|⚠️|🚨|⏰|🩺|💰|📝)/u);
    const emoji = emojiMatch ? emojiMatch[0] : '•';
    const title = titleLine.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}⚠️🚨⏰🩺💰📝]\s*/u, '').trim();
    
    if (title && restContent) {
      sections.push({ title, content: restContent, emoji });
    }
  }
  
  return sections;
}

function CollapsibleSection({ section, defaultOpen = false }: { section: Section; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 py-3 px-1 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="text-lg">{section.emoji}</span>
        <span className="font-medium flex-1 text-sm">{section.title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <div className={cn(
        "overflow-hidden transition-all duration-200",
        isOpen ? "max-h-[2000px] opacity-100 pb-3" : "max-h-0 opacity-0"
      )}>
        <div className="prose prose-sm dark:prose-invert max-w-none px-1 pl-7">
          <ReactMarkdown>{section.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export function AIVetMessage({ content }: AIVetMessageProps) {
  // If content is still loading (just "...")
  if (content === '...') {
    return <span className="text-muted-foreground">...</span>;
  }
  
  const sections = parseMessageIntoSections(content);
  
  // If we couldn't parse sections, just render as markdown
  if (sections.length === 0) {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }
  
  // Priority sections that should be open by default
  const prioritySections = ['紧急程度', 'Urgency Level', '建议就诊时间', 'Suggested Timing'];
  
  return (
    <div className="space-y-0">
      {sections.map((section, index) => (
        <CollapsibleSection 
          key={index} 
          section={section}
          defaultOpen={prioritySections.some(p => section.title.includes(p)) || index === 0}
        />
      ))}
    </div>
  );
}
