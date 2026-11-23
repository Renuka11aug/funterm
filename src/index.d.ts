export type ThemeName = 'meme' | 'arcade' | 'rainbow' | 'minimal';
export type SoundName = 'fa' | 'success' | 'warning';
export type MemeCategory = 'error' | 'success' | 'warning' | 'info' | 'loading';

export interface FunTermConfig {
  theme: ThemeName;
  sound: boolean;
  colors: boolean;
  animations: boolean;
  memes: boolean;
  randomMessages: boolean;
  showStack: boolean;
  showOriginalError: boolean;
  errorSoundCooldown: number;
  volume: number;
}

export interface ConfigApi {
  get(): FunTermConfig;
  set(partial: Partial<FunTermConfig>): FunTermConfig;
  reset(): FunTermConfig;
}

export interface ColorsApi {
  black(text: unknown): string;
  red(text: unknown): string;
  green(text: unknown): string;
  yellow(text: unknown): string;
  blue(text: unknown): string;
  magenta(text: unknown): string;
  cyan(text: unknown): string;
  white(text: unknown): string;
  gray(text: unknown): string;
  bold(text: unknown): string;
  underline(text: unknown): string;
  dim(text: unknown): string;
  rainbow(text: unknown): string;
  gradient(text: unknown, stops: string[]): string;
  strip(text: unknown): string;
  isEnabled(): boolean;
}

export interface MemeApi {
  message(kind: MemeCategory, options?: { random?: () => number }): string;
  show(kind: MemeCategory, options?: { random?: () => number }): string;
  categories: readonly MemeCategory[];
}

export interface SoundResult {
  played: boolean;
  fallback: false | 'bell';
  reason: string | null;
}

export interface SoundApi {
  play(name: SoundName): Promise<SoundResult>;
  enable(): void;
  disable(): void;
  setEnabled(enabled: boolean): void;
  setVolume(volume: number): void;
  getVolume(): number;
  names: readonly SoundName[];
}

export interface LoggerApi {
  info(message: unknown): string;
  success(message: unknown): string;
  warning(message: unknown): string;
  error(error: unknown, options?: { showStack?: boolean }): string;
}

export interface UiApi {
  banner(title: unknown): string;
  box(content: unknown, options?: { padding?: number }): string;
  table(rows: unknown[][], options?: { gap?: number }): string;
  divider(char?: string, width?: number): string;
}

export interface SpinnerHandle {
  stop(message?: string): void;
}

export interface ProgressHandle {
  update(value: number): void;
  stop(): void;
}

export interface AnimationsApi {
  spinner(label?: string): SpinnerHandle;
  progress(total: number, options?: { label?: string }): ProgressHandle;
}

export interface CommandResult {
  command: string;
  args: string[];
  success: boolean;
  exitCode: number | null;
  signal: string | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  error: Error | null;
  timedOut: boolean;
}

export interface RunOptions {
  cwd?: string;
  env?: Record<string, string | undefined>;
  timeout?: number;
  killGrace?: number;
  report?: boolean;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
}

export interface FunTermApi {
  config: ConfigApi;
  colors: ColorsApi;
  memes: MemeApi;
  sound: SoundApi;
  logger: LoggerApi;
  ui: UiApi;
  animations: AnimationsApi;
  run(command: string, args?: string[], options?: RunOptions): Promise<CommandResult>;
}

declare const funterm: FunTermApi;
export const config: ConfigApi;
export const colors: ColorsApi;
export const memes: MemeApi;
export const sound: SoundApi;
export const logger: LoggerApi;
export const ui: UiApi;
export const animations: AnimationsApi;
export const run: FunTermApi['run'];
export default funterm;
