export interface DocumentResult {
  text: string
  sourceDocuments: SourceDocument[]
}

export interface SourceDocument {
  pageContent: string
  metadata: Metadata
}

export interface Metadata {
  source: string
  pdf: Pdf
  loc: Loc
}

export interface Pdf {
  version: string
  info: Info
  metadata: any
  totalPages: number
}

export interface Info {
  PDFFormatVersion: string
  IsAcroFormPresent: boolean
  IsXFAPresent: boolean
  Author: string
  Creator: string
  Producer: string
  CreationDate: string
  ModDate: string
}

export interface Loc {
  pageNumber: number
}
