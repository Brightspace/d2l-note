import '@brightspace-ui/core/components/icons/icon.js';
import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/button/button-icon.js';
import 'd2l-alert/d2l-alert';

/**
 * Import LitElement base class, html helper function,
 * and TypeScript decorators
 **/
import { html, LitElement } from 'lit-element';

import { inputStyles } from '@brightspace-ui/core/components/inputs/input-styles.js';
import { IronA11yAnnouncer } from '@polymer/iron-a11y-announcer/iron-a11y-announcer';
import { langResources } from './lang';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin.js';

/**
 * d2l-note-edit component created with lit-element
 *
 * # Usage
 * ```html
 * <d2l-note-edit
 *	 id="edit"
 *	 placeholder="Placeholder"
 *	 value="Initial note text"
 *	 expanded
 *	 addnotestring="Add"
 *	 savenotestring="Save"
 *	 discardnotestring="Discard"
 *>
 *	 <div slot="description">Description</div>
 *	 <div slot="settings">Settings slot</div>
 * </d2l-note-edit>
 * ```
 */
export class D2LNoteEdit extends LocalizeMixin(LitElement) {

	static get properties() {
		return {
			/**
			 * Indicates this control creates a new item
			 */
			new: { type: Boolean },
			/**
			 * Contents of note. Updates with change event on textarea
			 */
			value: { type: String },
			/**
			 * Placeholder for textarea
			 */
			placeholder: { type: String },
			/**
			 * Text for the 'Add' button. Defaults to langified 'Add'
			 */
			addnotestring: { type: String },
			/**
			 * Text for the 'Save' button. Defaults to langified 'Save'
			 */
			savenotestring: { type: String },
			/**
			 * Label for the 'Discard' button. Defaults to langified 'Discard'
			 */
			discardnotestring: { type: String },
			/**
			 * True while a request is being made, disables the components, defaults to false
			 */
			_makingCall: { type: Boolean },
			/**
			 * Indicates whether the component is in its expanded state. If true,
			 * The textarea is set to its maximum height, the controls are visible.
			 */
			expanded: { type: Boolean, reflect: true },
			/**
			 * The error message to show if set. Shows a d2l-alert component and
			 * sets the color of the textarea to --d2l-alert-critical-color
			 */
			errormessage: { type: String },
		};
	}

	constructor() {
		super();
		this.new = false;
		this.value = '';
		this.placeholder = '';
		this._makingCall = false;
		this.expanded = false;

		/**
		 * Fired when edit is finished
		 * @fires d2l-note-edit-finished
		 */
		this.EVENT_FINISHED = 'd2l-note-edit-finished';

		/**
		 * Fired when Add button is tapped
		 * @fires d2l-note-edit-add
		 */
		this.EVENT_ADD = 'd2l-note-edit-add';

		/**
		 * Fired when Save button is tapped
		 * @fires d2l-note-edit-save
		 */
		this.EVENT_SAVE = 'd2l-note-edit-save';

		/**
		 * Fired when Discard button is tapped
		 * @fires d2l-note-edit-discard
		 */
		this.EVENT_DISCARD = 'd2l-note-edit-discard';
	}

	static async getLocalizeResources(langs) {
		for (let i = 0; i < langs.length; i++) {
			if (langResources[langs[i]]) {
				return {
					resources: langResources[langs[i]],
					language: langs[i],
				};
			}
		}
	}

	static get styles() {
		return inputStyles;
	}

	connectedCallback() {
		super.connectedCallback();
		if (!IronA11yAnnouncer.assertiveInstance) {
			IronA11yAnnouncer.assertiveInstance = document.createElement('iron-a11y-announcer');
		}
		IronA11yAnnouncer.assertiveInstance.mode = 'assertive';
		document.body.appendChild(IronA11yAnnouncer.assertiveInstance);
	}

	updated(changedProps) {
		super.updated(changedProps);
		if (changedProps.has('errormessage') && this.errormessage) {
			IronA11yAnnouncer.assertiveInstance.announce(this.errormessage);
		}
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

					--d2l-note-edit-spacing: 12px;
					--d2l-note-edit-textarea-font-size: 1rem;

					/* need to set px for transitioning in Edge/IE11 */
					/* height: calc(var(--d2l-note-edit-textarea-line-height) + var(--d2l-note-edit-textarea-padding-vertical) * 2 + 2px); */
					--d2l-note-edit-textarea-collapsed-height: 2.3rem;
					/* height: calc(var(--d2l-note-edit-textarea-line-height) * 4 + var(--d2l-note-edit-textarea-padding-vertical) * 2 + 2px); */
					--d2l-note-edit-textarea-expanded-height: 95px;

					--d2l-note-edit-textarea-padding-vertical: 0.5rem;
					--d2l-note-edit-textarea-padding-horizontal: 0.75rem;
					--d2l-note-edit-transition-duration: 0.5s;
				}

				.d2l-note-edit-controls {
					margin-top: var(--d2l-note-edit-spacing);
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					flex-wrap: wrap-reverse;

					transition-property: max-height, opacity, visibility;
					transition-duration: var(--d2l-note-edit-transition-duration), var(--d2l-note-edit-transition-duration);
					transition-timing-function: ease, ease;

					@apply --d2l-note-edit-controls;
				}

				.d2l-note-edit-button {
					margin-right: 0.5rem;
				}

				:host(:dir(rtl)) .d2l-note-edit-button {
					margin-right: initial;
					margin-left: 0.5rem;
				}
				:host-context([dir="rtl"]) > .d2l-note-edit-main .d2l-note-edit-button {
					margin-right: initial;
					margin-left: 0.5rem;
				}

				:host(:not([focused])) .d2l-note-edit-controls,
				:host(:not([expanded])) .d2l-note-edit-controls {
					max-height: 0;
					opacity: 0;
					visibility: hidden;

					transition-delay: var(--d2l-note-edit-transition-duration), 0s, var(--d2l-note-edit-transition-duration);

					@apply --d2l-note-edit-controls-nofocus;
				}

				:host([focused]) .d2l-note-edit-controls,
				:host([expanded]) .d2l-note-edit-controls {
					max-height: 90px;
					opacity: 1;
					visibility: visible;

					transition-delay: 0s, var(--d2l-note-edit-transition-duration), var(--d2l-note-edit-transition-duration);

					@apply --d2l-note-edit-controls-focus;
				}

				.d2l-note-edit-bottom-right {
					display: flex;
					flex-direction: row;
					flex: 1 0 auto;
					justify-content: space-between;

					@apply --d2l-note-edit-bottom-right;
				}

				.d2l-note-edit-settings {
					display: inline-flex;
					align-items: center;

					@apply --d2l-note-edit-settings;
				}

				d2l-alert {
					margin-top: var(--d2l-note-edit-spacing);

					@apply --d2l-note-edit-error-alert;
				}

				textarea.d2l-input.d2l-note-edit-error {
					border-color: var(--d2l-alert-critical-color, --d2l-color-cinnabar);

					@apply --d2l-note-edit-error-textarea;
				}

				textarea.d2l-input {
					padding: var(--d2l-note-edit-textarea-padding-vertical) var(--d2l-note-edit-textarea-padding-horizontal);

					font-size: var(--d2l-note-edit-textarea-font-size);

					transition-property: height, background-color, border-color;
					transition-duration: var(--d2l-note-edit-transition-duration), var(--d2l-note-edit-transition-duration), var(--d2l-note-edit-transition-duration);
					transition-timing-function: ease, ease, ease;
				}

				:host(:not([focused])) textarea.d2l-input,
				:host(:not([expanded])) textarea.d2l-input {
					height: var(--d2l-note-edit-textarea-collapsed-height);
					transition-delay: var(--d2l-note-edit-transition-duration), 0s, 0s;
					@apply --d2l-note-edit-textarea-nofocus;
				}

				:host([focused]) textarea.d2l-input,
				:host([expanded]) textarea.d2l-input {
					height: var(--d2l-note-edit-textarea-expanded-height);
					transition-delay: 0s, 0s, 0s;
					@apply --d2l-note-edit-textarea-focus;
				}

				textarea.d2l-input.d2l-note-edit-error:hover,
				textarea.d2l-input.d2l-note-edit-error:focus {
					border-color: var(--d2l-color-feedback-error, --d2l-color-cinnabar);
					border-width: 2px;
					outline-style: none;
					outline-width: 0;
				}

				textarea.d2l-input::placeholder {
					color: var(--d2l-input-placeholder-color);
					font-size: var(--d2l-note-edit-textarea-font-size);
					font-weight: 400;
					opacity: 1; /* Firefox has non-1 default */
				}

				textarea.d2l-input:focus {
					padding: calc(var(--d2l-note-edit-textarea-padding-vertical) - 1px) calc(var(--d2l-note-edit-textarea-padding-horizontal) - 1px);
				}
			</style>
			<div class="d2l-note-edit-description">
				<slot name="description"></slot>
			</div>
			<div
				class="d2l-note-edit-main"
				@focusin=${this._handleFocusin}
				@focusout=${this._handleFocusout}
			>
				<textarea
					class="d2l-input ${this.errormessage ? 'd2l-note-edit-error' : ''}"
					.value=${this.value}
					placeholder="${this.placeholder}"
					@input=${this._handleInput}
					?disabled="${this._makingCall}"
				></textarea>
				<d2l-alert role="alert" type="error" .hidden=${!this.errormessage}>${this.errormessage}</d2l-alert>
				<div class="d2l-note-edit-controls">
					<d2l-button
						class="d2l-note-edit-button"
						primary
						@click=${this._handleEditClick}
						?disabled="${this._makingCall}"
					>
						${this.new ? this.addnotestring ? this.addnotestring : this.localize('add') : this.savenotestring ? this.savenotestring : this.localize('save')}
					</d2l-button>
					<div class="d2l-note-edit-bottom-right">
						<div class="d2l-note-edit-settings">
							<slot name="settings"></slot>
						</div>
						<d2l-button-icon
							class="d2l-note-edit-discard-button"
							icon="d2l-tier2:delete"
							text="${this.discardnotestring ? this.discardnotestring : this.localize('discard')}"
							@click=${this._handleClick}
						></d2l-button-icon>
					</div>
				</div>
			</div>
		`;
	}

	_handleInput(e) {
		this.value = e.target && (e.target).value;
	}

	_handleEditClick() {
		this.errormessage = undefined;
		const finish = (error) => {
			this._makingCall = false;
			if (error) {
				this.errormessage = error.message ? error.message : error;
				return;
			}
			this.dispatchEvent(new CustomEvent(this.EVENT_FINISHED, {
				bubbles: true,
				composed: true,
				detail: {
					id: this.id,
					value: this.value
				}
			}));
			this.value = '';
		};
		this._makingCall = true;
		let succeeded = false;
		if (this.new) {
			succeeded = this.dispatchEvent(new CustomEvent(this.EVENT_ADD, {
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
			succeeded = this.dispatchEvent(new CustomEvent(this.EVENT_SAVE, {
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
		this.errormessage = undefined;
		const discarded = this.dispatchEvent(new CustomEvent(this.EVENT_DISCARD, {
			bubbles: true,
			composed: true,
			cancelable: true,
			detail: {
				id: this.id,
				value: this.value
			}
		}));

		if (discarded) {
			this.dispatchEvent(new CustomEvent(this.EVENT_FINISHED, {
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

	_handleFocusin() {
		this.setAttribute('focused', '');
		window.ShadyCSS && window.ShadyCSS.styleSubtree(this);
	}

	_handleFocusout() {
		this.removeAttribute('focused');
		window.ShadyCSS && window.ShadyCSS.styleSubtree(this);
	}
}

customElements.define('d2l-note-edit', D2LNoteEdit);
