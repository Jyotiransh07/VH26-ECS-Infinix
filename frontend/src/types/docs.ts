export interface TocItem {
  id: string;
  title: string;
  level?: number;
}

export interface DocSection {
  id: string;
  title: string;
  category: string;
  description: string;
  breadcrumbs: string[];
  toc: TocItem[];
  content: React.ReactNode;
}

export interface SearchResult {
  sectionId: string;
  title: string;
  category: string;
  snippet: string;
}
