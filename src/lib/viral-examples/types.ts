export interface ViralCategory {
  id: string;
  icon: string;
  labelKey: string;
}

export interface ViralExampleDef {
  queryKey: string;
  categoryId: string;
}

export interface ViralExample {
  query: string;
  categoryId: string;
}

export type LocalizedQueries = Record<string, string>;
