import type { Asset, Vulnerability } from '../types';
import type { AiAnalysisResult } from './aiAnalystService';

/** Remote provider credentials and calls belong in an authenticated backend. */
export type LlmProvider = 'openai' | 'gemini' | 'anthropic' | 'ollama' | 'local';
export interface ProviderConfig {
  activeProvider: LlmProvider;
  keys: { openai: string; gemini: string; anthropic: string };
  models: { openai: string; gemini: string; anthropic: string; ollama: string };
  ollamaEndpoint: string;
}

const LOCAL_CONFIG: ProviderConfig = {
  activeProvider: 'local',
  keys: { openai: '', gemini: '', anthropic: '' },
  models: { openai: '', gemini: '', anthropic: '', ollama: '' },
  ollamaEndpoint: '',
};

export function getLlmConfig(): ProviderConfig { return LOCAL_CONFIG; }
export function saveLlmConfig(_config: ProviderConfig): void { /* deliberately no browser persistence */ }

const BACKEND_REQUIRED = 'Remote AI providers are disabled in the browser. Configure an authenticated server-side AI gateway.';

export async function fetchLiveAiAnalysisFromActiveProvider(_vuln: Vulnerability, _asset?: Asset): Promise<{ result: AiAnalysisResult; providerName: string }> {
  throw new Error(BACKEND_REQUIRED);
}

export async function fetchLiveAiChatFromActiveProvider(
  _query: string,
  _vulnerabilities: Vulnerability[],
  _history: { sender: 'user' | 'bot'; text: string }[] = [],
): Promise<{ text: string; providerName: string }> {
  throw new Error(BACKEND_REQUIRED);
}
