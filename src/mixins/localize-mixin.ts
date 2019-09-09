import d2lIntl from 'd2l-intl';
import IntlMessageFormat from 'intl-messageformat/src/main';
import { LangTerm } from '../lang';
import {
	property
} from 'lit-element';

window.IntlMessageFormat = IntlMessageFormat;

declare global {
	interface Window {
		IntlMessageFormat: typeof IntlMessageFormat;
	}
}

const assign =
	Object.assign ? Object.assign.bind(Object) : function(destination: { [key: string]: any }, source: { [key: string]: any }) {
		for (const prop in source) {
			if (source.hasOwnProperty(prop)) {
				destination[prop] = source[prop];
			}
		}

		return destination;
	};

type Constructor<T> = new(...args: any[]) => T;

export interface LocalizeMixinProto {
	__localizationCache: {
		messages: {
			[key: string]: IntlMessageFormat | undefined;
		};
		requests: {
			[key: string]: any;
		};
	};
}

export function LocalizeMixin<B extends Constructor<{
	connectedCallback(): void;
	dispatchEvent(evt: Event): boolean;
}>>(superClass: B) {
	abstract class LocalizeMixinClass extends superClass {
		@property({ type: String })
		__documentLanguage: string | null;
		@property({ type: String })
		__documentLanguageFallback: string | null;
		@property({ type: String })
		__language?: string;
		@property({ type: Object })
		__overrides: object;
		@property({ type: Object })
		__resources?: { [key: string]: { [key: string]: string } };
		@property({ type: Object })
		__timezoneObject: { name?: string; identifier?: string };
		@property({ type: String })
		__timezone?: string;

		_observer?: MutationObserver;

		resourceFetchComplete: Promise<void>;
		__resourceFetchCompleteResolve?: () => void;
		__resourceFetchCompleteReject?: () => void;

		abstract getLangResources(lang?: string): Promise<{ [key: string]: string }>
		abstract getLanguage(possibleLanguages: string[]): string | undefined;

		connectedCallback() {
			super.connectedCallback();
		}

		constructor(...args: any[]) {
			super(...args);

			this.__documentLanguage = window.document.getElementsByTagName('html')[0].getAttribute('lang');
			this.__documentLanguageFallback = window.document.getElementsByTagName('html')[0].getAttribute('data-lang-default');

			this.__overrides = this._tryParseHtmlElemAttr('d2l-intl-overrides', {});
			this.__timezoneObject = this._tryParseHtmlElemAttr('data-timezone', {name: '', identifier: ''});
			this.__timezone = this._computeTimezone();
			this.resourceFetchComplete = new Promise((resolve, reject) => {
				this.__resourceFetchCompleteResolve = resolve;
				this.__resourceFetchCompleteReject = reject;
			});

			this._startObserver();
		}

		updated(changedProperties: Map<string, string>) {
			changedProperties.forEach((_oldValue, propName) => {
				if (propName === '__documentLanguage' || propName === '__documentLanguageFallback') {
					const possibleLanguages = this._generatePossibleLanguages(this.__documentLanguage, this.__documentLanguageFallback);
					this.__language = this.getLanguage(possibleLanguages);
				} else if (propName === '__language') {
					this._languageChange();

					// Everytime language or resources change, invalidate the messages cache.
					const proto: LocalizeMixinProto = this.constructor.prototype;
					this.checkLocalizationCache(proto);
					proto.__localizationCache.messages = {};

					this.getLangResources(this.__language)
						.then((res) => {
							if (!res || !this.__language) {
								return;
							}
							this._onRequestResponse(res, this.__language);
						})
						.then(this.__resourceFetchCompleteResolve, this.__resourceFetchCompleteReject);
				} else if (propName === '__timezoneObject') {
					this._timezoneChange();
				}
			});
		}

		/**
		 * Same functionality as app-localize-behavior.localize:
		 * https://github.com/PolymerElements/app-localize-behavior/blob/master/app-localize-behavior.js
		 *
		 * Translates a string to the current `language`. Any parameters to the
		 * string should be passed in order, as follows:
		 * `localize(stringKey, param1Name, param1Value, param2Name, param2Value)`
		*/
		localize(key: LangTerm, ...args: any[]) {
			return this._computeLocalize(this.__language, this.__resources, key, ...args);
		}

		checkLocalizationCache(proto: LocalizeMixinProto) {
			// do nothing if proto is undefined.
			if (proto === undefined)
				return;

			// In the event proto not have __localizationCache object, create it.
			if (proto['__localizationCache'] === undefined) {
				proto['__localizationCache'] = {messages: {}, requests: {}};
			}
		}

		getTimezone() {
			return this.__timezoneObject;
		}

		formatDateTime(val: Date, opts?: d2lIntl.DateFormatOpts) {
			opts = opts || {};
			opts.locale = this.__overrides;
			opts.timezone = opts.timezone || this.__timezone;
			const formatter = new d2lIntl.DateTimeFormat(this.__language, opts);
			return formatter.format(val);
		}

		formatDate(val: Date, opts?: d2lIntl.DateFormatOpts) {
			opts = opts || {};
			opts.locale = this.__overrides;
			opts.timezone = opts.timezone || this.__timezone;
			const formatter = new d2lIntl.DateTimeFormat(this.__language, opts);
			return formatter.formatDate(val);
		}

		formatFileSize(val: number) {
			const formatter = new d2lIntl.FileSizeFormat(this.__language);
			return formatter.format(val);
		}

		formatNumber(val: number, opts?: d2lIntl.NumberFormatOpts) {
			opts = opts || {};
			opts.locale = this.__overrides;
			const formatter = new d2lIntl.NumberFormat(this.__language, opts);
			return formatter.format(val);
		}

		formatTime(val: Date, opts?: d2lIntl.DateFormatOpts) {
			opts = opts || {};
			opts.locale = this.__overrides;
			opts.timezone = opts.timezone || this.__timezone;
			const formatter = new d2lIntl.DateTimeFormat(this.__language, opts);
			return formatter.formatTime(val);
		}

		parseDate(val: string) {
			const parser = new d2lIntl.DateTimeParse(
				this.__language,
				{ locale: this.__overrides }
			);
			return parser.parseDate(val);
		}

		parseNumber(val: string, opts?: d2lIntl.FormatOpts) {
			opts = opts || {};
			opts.locale = this.__overrides;
			const parser = new d2lIntl.NumberParse(this.__language, opts);
			return parser.parse(val);
		}

		parseTime(val: string) {
			const parser = new d2lIntl.DateTimeParse(this.__language);
			return parser.parseTime(val);
		}

		_startObserver() {
			const htmlElem = window.document.getElementsByTagName('html')[0];

			this._observer = new MutationObserver((mutations) => {
				for (let i = 0; i < mutations.length; i++) {
					const mutation = mutations[i];
					if (mutation.attributeName === 'lang') {
						this.__documentLanguage = htmlElem.getAttribute('lang');
					} else if (mutation.attributeName === 'data-lang-default') {
						this.__documentLanguageFallback = htmlElem.getAttribute('data-lang-default');
					} else if (mutation.attributeName === 'data-intl-overrides') {
						this.__overrides = this._tryParseHtmlElemAttr('data-intl-overrides', {});
					} else if (mutation.attributeName === 'data-timezone') {
						this.__timezoneObject = this._tryParseHtmlElemAttr('data-timezone', {name: '', identifier: ''});
					}
				}
			});
			this._observer.observe(htmlElem, { attributes: true });
		}

		_generatePossibleLanguages(docLang: string | null, docFallbackLang: string | null) {
			const langs: string[] = [];

			if (docLang) {
				docLang = docLang.toLowerCase();
				langs.push(docLang);

				if (docLang.indexOf('-') !== -1) {
					const baseDocLang = docLang.split('-')[0];
					langs.push(baseDocLang);
				}
			}

			if (docFallbackLang) {
				docFallbackLang = docFallbackLang.toLowerCase();
				langs.push(docFallbackLang);

				if (docFallbackLang.indexOf('-') !== -1) {
					const baseDocFallbackLang = docFallbackLang.split('-')[0];
					langs.push(baseDocFallbackLang);
				}
			}

			langs.push('en-us', 'en');

			return langs;
		}

		_computeTimezone() {
			return this.__timezoneObject && this.__timezoneObject.name;
		}

		_languageChange() {
			this.dispatchEvent(new CustomEvent(
				'd2l-localize-behavior-language-changed', { bubbles: true, composed: true }
			));
		}

		_timezoneChange() {
			this.dispatchEvent(new CustomEvent(
				'd2l-localize-behavior-timezone-changed', { bubbles: true, composed: true }
			));
		}

		_onRequestResponse(newResources: { [key: string]: string }, language: string) {
			const propertyUpdates: { resources?: { [key: string]: { [key: string]: string } }} = {};
			propertyUpdates.resources = assign({}, this.__resources || {});
			propertyUpdates.resources[language] =
					assign(propertyUpdates.resources[language] || {}, newResources);
			this.__resources = propertyUpdates.resources;
		}

		_computeLocalize(language?: string, resources?: { [key: string]: { [key: string]: string } }, key?: string, ...args: any[]) {
			const proto: LocalizeMixinProto = this.constructor.prototype;
			this.checkLocalizationCache(proto);

			if (!key || !resources || !language || !resources[language])
				return;

			// Cache the key/value pairs for the same language, so that we don't
			// do extra work if we're just reusing strings across an application.
			const translatedValue = resources[language][key];

			if (!translatedValue) {
				return '';
			}

			const messageKey = key + translatedValue;
			let translatedMessage = proto.__localizationCache.messages[messageKey];

			if (!translatedMessage) {
				translatedMessage =
						new IntlMessageFormat(translatedValue, language);
				proto.__localizationCache.messages[messageKey] = translatedMessage;
			}

			return translatedMessage.format(args);
		}

		_tryParseHtmlElemAttr<T>(attrName: string, defaultValue: T) {
			const htmlElems = window.document.getElementsByTagName('html');
			if (htmlElems.length === 1 && htmlElems[0].hasAttribute(attrName)) {
				try {
					return JSON.parse(htmlElems[0].getAttribute(attrName) as string) as T;
				} catch (e) {
					// swallow exception
				}
			}
			return defaultValue;
		}
	}
	return LocalizeMixinClass;
}
