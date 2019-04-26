import 'd2l-inputs/d2l-input-textarea';
import 'd2l-icons/tier2-icons';
import 'd2l-button/d2l-button';
import 'd2l-button/d2l-button-icon';
/**
 * Import LitElement base class, html helper function,
 * and TypeScript decorators
 **/
import {
	customElement, html, LitElement, property
} from 'lit-element';

import { LocalizeMixin } from './mixins/localize-mixin';

/**
 * Use the customElement decorator to define your class as
 * a custom element. Registers <my-element> as an HTML tag.
 */
@customElement('d2l-note-edit')
export class D2LNoteEdit extends LocalizeMixin(LitElement) {

	/**
	 * Create an observed property. Triggers update on change.
	 */
	@property({ type: Boolean })
	new: boolean = false;

	@property({ type: String })
	value: string = '';

	@property({ type: String })
	placeholder: string = '';

	@property({ type: String })
	addnotestring?: string;

	@property({ type: String })
	savenotestring?: string;

	@property({ type: String })
	discardnotestring?: string;

	__langResources = {
		'en': {
			'add': 'Add',
			'save': 'Save',
			'discard': 'Discard'
		}
	}

	getLanguage(langs: string[]) {
		for (let i = 0; i < langs.length; i++) {
			if (this.__langResources[langs[i]]) {
				return langs[i];
			}
		}
	}

	async getLangResources(lang: string) {
		const proto = this.constructor.prototype;
		this.checkLocalizationCache(proto);

		const namespace = `d2l-note-edit:${lang}`;

		if (proto.__localizationCache.requests[namespace]) {
			return proto.__localizationCache.requests[namespace];
		}

		const result = this.__langResources[lang];

		proto.__localizationCache.requests[namespace] = result;
		return result;
	}

	/**
	 * Implement `render` to define a template for your element.
	 */
	render() {
		/**
		 * Use JavaScript expressions to include property values in
		 * the element template.
		 */
		return html`
			<style>
				:host {
					display: block;
					line-height: 0;
				}
				.d2l-note-edit-bottom {
					margin-top: 12px;
					display: flex;
					flex-direction: row;
					justify-content: space-between;
				}

				.d2l-note-edit-bottom-left {
					display: flex;
					flex-direction: row;
				}

				.d2l-note-edit-settings {
					margin-left: 0.5rem;
					margin-right: 0.5rem;
				}
			</style>

			<div class="d2l-note-edit-description">
				<slot name="description"></slot>
			</div>
			<d2l-input-textarea
				value="${this.value}"
				placeholder="${this.placeholder}"
				@change=${this._handleChange}
			></d2l-input-textarea>
			<div class="d2l-note-edit-bottom">
				<div class="d2l-note-edit-bottom-left">
					<d2l-button
						class="d2l-note-edit-button"
						primary
						@click=${this._handleEditClick}
					>
						${this.new ? this.addnotestring ? this.addnotestring : this.localize('add') : this.savenotestring ? this.savenotestring : this.localize('save')}
					</d2l-button>
					<div class="d2l-note-edit-settings">
						<slot name="settings"></slot>
					</div>
				</div>
				<d2l-button-icon
					class="d2l-note-edit-discard-button"
					icon="d2l-tier2:delete"
					text="${this.discardnotestring ? this.discardnotestring : this.localize('discard')}"
					@click=${this._handleClick}
				></d2l-button-icon>
			</div>
		`;
	}

	_handleChange(e: Event) {
		this.value = e.target && (e.target as any).value;
	}

	_handleEditClick() {
		const finish = () => {
			this.dispatchEvent(new CustomEvent('d2l-note-edit-finished', {
				bubbles: true,
				composed: true,
				detail: {
					id: this.id,
					value: this.value
				}
			}));
			this.value = '';
		};
		let succeeded = false;
		if (this.new) {
			succeeded = this.dispatchEvent(new CustomEvent('d2l-note-edit-add', {
				bubbles: true,
				composed: true,
				cancelable: true,
				detail: {
					id: this.id,
					text: this.value,
					finish
				}
			}));
		} else {
			succeeded = this.dispatchEvent(new CustomEvent('d2l-note-edit-save', {
				bubbles: true,
				composed: true,
				cancelable: true,
				detail: {
					id: this.id,
					text: this.value,
					finish
				}
			}));
		}
		if (succeeded) {
			finish();
		}
	}

	_handleClick() {
		const discarded = this.dispatchEvent(new CustomEvent('d2l-note-edit-discard', {
			bubbles: true,
			composed: true,
			cancelable: true,
			detail: {
				id: this.id,
				value: this.value
			}
		}));

		if (discarded) {
			this.dispatchEvent(new CustomEvent('d2l-note-edit-finished', {
				bubbles: true,
				composed: true,
				detail: {
					id: this.id,
					value: this.value
				}
			}));
			this.value = '';
		}
	}
}
