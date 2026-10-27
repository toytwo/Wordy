export type Word = [{
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
}];

export type Meta = {
  id: string;
  uuid: string;
  sort: string;
  src: string;
  section: string;
  stems: string[];
  offensive: boolean;
};

export type Hwi = {
  hw: string;
  prs?: Pronunciation[];
};

export type Pronunciation = {
  mw: string;
  sound?: Sound;
};

export type Sound = {
  audio: string;
  ref: string;
  stat: string;
};

export type Definition = {
  sseq: SenseItem[][];
  vd?: string;
};

export type SenseItem =
  | ["sense", Sense]
  | ["bs", { sense: Sense }]
  | ["pseq", SenseItem[]]
  | ["sen", Partial<Sense>];

export type Sense = {
  sn?: string;
  dt: DefinitionText[];
  sls?: string[];
  sdsense?: {
    sd: string;
    dt: DefinitionText[];
  };
};

export type DefinitionText =
  | ["text", string]
  | ["vis", Example[]]
  | ["snote", DefinitionText[]]
  | ["uns", DefinitionText[][]];

export type Example = {
  t: string;
  aq?: unknown;
};

export type Uro = {
  ure: string;
  fl: string;
};

export type EtItem =
  | ["text", string]
  | ["et_snote", EtNote[]];

export type EtNote = {
  t: string;
};

export type Link = {
  link_hw: string;
  link_fl: string;
};

export type Supplementary = {
  examples?: Example[];
  ldq?: unknown;
};