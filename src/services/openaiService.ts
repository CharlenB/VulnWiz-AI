import type { Asset, Vulnerability } from '../types';
import type { AiAnalysisResult } from './aiAnalystService';

const BACKEND_REQUIRED = 'Direct browser-to-provider AI calls are disabled. Use an authenticated server-side AI gateway.';

export function getOpenAiApiKey(): null { return null; }
export function setOpenAiApiKey(_key: string): void { /* intentionally disabled */ }
export function getOpenAiModel(): string { return ''; }
export function setOpenAiModel(_model: string): void { /* intentionally disabled */ }
export async function fetchLiveAiAnalysisFromOpenAi(_vuln: Vulnerability, _asset?: Asset): Promise<AiAnalysisResult> { throw new Error(BACKEND_REQUIRED); }
export async function fetchLiveAiChatFromOpenAi(_query: string, _vulns: Vulnerability[], _history: { sender: 'user' | 'bot'; text: string }[] = []): Promise<string> { throw new Error(BACKEND_REQUIRED); }
