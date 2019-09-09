import { en } from './locales/en';

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
	en,
};
