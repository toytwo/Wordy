export class WordNotFoundError extends Error {
  constructor(public word: string, public suggestions: string[] | null) {
    super(`Word not found: ${word}`);
    this.name = "WordNotFoundError";
  }
}

export class RequestFailedError extends Error {
  constructor(public source: string, public status: number){
    super(`${source} request failed: ${status}`)
    this.name = "RequestFailedError";
  }
}