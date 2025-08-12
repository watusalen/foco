/**
 * @module Gemini
 * @description
 * Este módulo fornece a integração com o Google Gemini LLM, expondo o cliente principal
 * (`GeminiClient`) e os tipos auxiliares utilizados.
 *
 * @example
 * import { GeminiClient } from './gemini';
 * import { GeminiRequest } from './gemini/types';
 *
 * const client = new GeminiClient({ apiKey: 'SUA_CHAVE_API' });
 * const response = await client.sendMessage('Olá, Gemini!');
 * console.log(response);
 */

export { GeminiClient } from './GeminiClient';
export * from './types';
