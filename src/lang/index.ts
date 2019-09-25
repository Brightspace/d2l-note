import { arSa } from './locales/ar-SA';
import { deDe } from './locales/de-DE';
import { en } from './locales/en';
import { esMx } from './locales/es-MX';
import { frCa } from './locales/fr-CA';
import { jaJp } from './locales/ja-JP';
import { koKr } from './locales/ko-KR';
import { nlNl } from './locales/nl-NL';
import { ptBr } from './locales/pt-BR';
import { svSe } from './locales/sv-SE';
import { trTr } from './locales/tr-TR';
import { zhCn } from './locales/zh-CN';
import { zhTw } from './locales/zh-TW';

export type LangTerm =
	'add' |
	'contextMenu' |
	'delete' |
	'discard' |
	'edit' |
	'empty' |
	'less' |
	'me' |
	'more' |
	'private' |
	'save' |
	'subtextEdited';

export type LangResource = {
	[key in LangTerm]: string;
};

export interface LangResourceMap {
	[key: string]: LangResource;
}

export const langResources: LangResourceMap = {
	'ar-SA': arSa,
	'de-DE': deDe,
	'en': en,
	'es-MX': esMx,
	'fr-CA': frCa,
	'ja-JP': jaJp,
	'ko-KR': koKr,
	'nl-NL': nlNl,
	'pt-BR': ptBr,
	'sv-SE': svSe,
	'tr-TR': trTr,
	'zh-CN': zhCn,
	'zh-TW': zhTw,
};
