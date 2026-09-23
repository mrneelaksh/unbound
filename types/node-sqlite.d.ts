declare module 'node:sqlite' {
  export interface StatementSync {
    all(...params: unknown[]): any[]
    get(...params: unknown[]): any
    run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint }
    sourceURL?: string
  }

  export class DatabaseSync {
    constructor(
      location: string,
      options?: {
        open?: boolean
        readOnly?: boolean
        enableForeignKeyConstraints?: boolean
        enableDoubleQuotedStringLiterals?: boolean
      }
    )
    close(): void
    exec(sql: string): void
    prepare(sql: string): StatementSync
  }
}
