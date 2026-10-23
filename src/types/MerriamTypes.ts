export interface Word {
  meta: Meta;
  hwi: Hwi;
  fl?: string;
  def: Definition[];
  uros?: Uro[];
  et?: EtItem[];
  date?: string;
  ld_link?: Link;
  suppl?: Supplementary;
  shortdef: string[];
}

export interface Meta {
  id: string;
  uuid: string;
  sort: string;
  src: string;
  section: string;
  stems: string[];
  offensive: boolean;
}

export interface Hwi {
  hw: string;
  prs?: Pronunciation[];
}

export interface Pronunciation {
  mw: string;
  sound?: Sound;
}

export interface Sound {
  audio: string;
  ref: string;
  stat: string;
}

export interface Definition {
  sseq: SenseItem[][];
  vd?: string;
}

export type SenseItem =
  | ["sense", Sense]
  | ["bs", { sense: Sense }]
  | ["pseq", SenseItem[]]
  | ["sen", Partial<Sense>];

export interface Sense {
  sn?: string;
  dt: DefinitionText[];
  sls?: string[];
  sdsense?: {
    sd: string;
    dt: DefinitionText[];
  };
}

export type DefinitionText =
  | ["text", string]
  | ["vis", Example[]]
  | ["snote", DefinitionText[]]
  | ["uns", DefinitionText[][]];

export interface Example {
  t: string;
  aq?: unknown;
}

export interface Uro {
  ure: string;
  fl: string;
}

export type EtItem =
  | ["text", string]
  | ["et_snote", EtNote[]];

export interface EtNote {
  t: string;
}

export interface Link {
  link_hw: string;
  link_fl: string;
}

export interface Supplementary {
  examples?: Example[];
  ldq?: unknown;
}

export type MerriamAPIResponse = { 
  word: Word | null, 
  error?: string | unknown, 
  options?: string[] 
}