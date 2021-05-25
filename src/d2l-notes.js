import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/colors/colors.js';
import './d2l-note';

/**
 * Import LitElement base class, html helper function,
 * and TypeScript decorators
 **/
import { html, LitElement } from 'lit-element';

import { bodyStandardStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { langResources } from './lang';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin.js';
import { repeat } from 'lit-html/directives/repeat';

/**
 * d2l-note component created with lit-element
 *
 * # Usage
 * ```html
 * <d2l-notes
 *	 id="notes"
 *	 dateformat="medium"
 *	 editstring="Edit Note"
 *	 deletestring="Delete Note"
 *	 privatelabel="Private"
 *	 addnotestring="Add"
 *	 savenotestring="Save"
 *	 discardnotestring="Discard"
 *	 editplaceholder="Placeholder for d2l-note-edit"
 * >
 *	 <div slot="description">Description for d2l-note-edit</div>
 * </d2l-notes>
 * <script>
 * document.getElementById('notes').description = (note) => note ? html`<p>Description for note</p>` : html`<p>Description for notes</p>`;
 * document.getElementById('notes').settings = (note) => note ? html`<div>Settings for note</div>` : html`<div>Settings for notes</div>`;
 * document.getElementById('notes').notes = [{
 *	user: {
 *		name: 'Username',
 *		pic: {
 *			url: 'url',
 *			requireTokenAuth: true,
 *		},
 *	},
 *	token: 'foozleberries',
 *	showAvatar: true,
 *	me: false,
 *	createdAt: '2019-04-23T17:08:33.839Z',
 *	updatedAt: '2019-04-24T17:08:33.839Z',
 *	text: 'Note',
 *	canEdit: true,
 *	canDelete: true,
 *	private: true,
 *	contextmenulabel: 'Context Menu'
 * }];
 * </script>
 * ```
 */
export class D2LNotes extends LocalizeMixin(LitElement) {
	static get properties() {
		return {
			/**
			 * Array of notes to pass to d2l-note elements
			 */
			notes: { type: Array },
			/**
			 * Indicates this user can create new notes
			 */
			cancreate: { type: Boolean },
			/**
			 * d2l-note-edit placeholder to show when creating
			 */
			editplaceholder: { type: String },
			/**
			 * TemplateResult containing description for d2l-note's in edit state and d2l-note-edit
			 */
			description: { type: Object },
			/**
			 * TemplateResult containing settings for d2l-note's in edit state and d2l-note-edit
			 */
			settings: { type: Object },
			/**
			 * Show the loadmore button regardless of number of items
			 */
			hasmore: { type: Boolean },
			/**
			 * Load more/less collapsed state
			 */
			collapsed: { type: Boolean },
			/**
			 * Number of items to show before showing the load more button
			 */
			collapsedsize: { type: Number },
			/**
			 * dateformat in d2l-note's
			 */
			dateformat: { type: String },
			/**
			 * override loadmore button text
			 */
			loadmorestring: { type: String },
			/**
			 * override loadless button text
			 */
			loadlessstring: { type: String },
			/**
			 * editstring in d2l-note's
			 */
			editstring: { type: String },
			/**
			 * deletestring in d2l-note's
			 */
			deletestring: { type: String },
			/**
			 * privatelabel in d2l-note's
			 */
			privatelabel: { type: String },
			/**
			 * addnotestring in d2l-note-edit
			 */
			addnotestring: { type: String },
			/**
			 * savenotestring in d2l-note's
			 */
			savenotestring: { type: String },
			/**
			 * discardnotestring in d2l-note's and d2l-note-edit
			 */
			discardnotestring: { type: String },
			/**
			 * string to show when there are no notes to show. Set to '' to not show anything
			 */
			emptystring: { type: String },
			/**
			 * label for the 'enter notes' area, overridden by emptystring if there are no existing notes. Does not render if undefined
			 */
			enternotestring: { type: String },
		};
	}

	constructor() {
		super();
		this.notes = [];
		this.cancreate = false;
		this.editplaceholder = '';
		this.description = () => html`<div></div>`;
		this.settings = () => html`<div></div>`;
		this.hasmore = false;
		this.collapsed = true;
		this.collapsedsize = 4;

		/**
		 * Fired when load more is tapped
		 * @fires d2l-notes-load-more
		 */
		this.EVENT_LOAD_MORE = 'd2l-notes-load-more';

		/**
		 * Fired when load less is tapped
		 * @fires d2l-notes-load-less
		 */
		this.EVENT_LOAD_LESS = 'd2l-notes-load-less';

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
		return bodyStandardStyles;
	}

	/**
	 * Implement `render` to define a template for your element.
	 */
	render() {
		const hasmore = this.hasmore || this.notes.length > this.collapsedsize;
		const notes = this.notes && this.collapsed ? this.notes.slice(0, this.collapsedsize) : this.notes;
		/**
		 * Use JavaScript expressions to include property values in
		 * the element template.
		 */
		return html`
			<style>
				:host {
					--d2l-notes-note-margin-top: 6px;
					--d2l-notes-note-margin-bottom: 12px;
					--d2l-notes-hr-margin-bottom: 18px;
					--d2l-notes-ol-margin-bottom: 24px;
					--d2l-notes-load-more-margin-bottom: 36px;
				}
				:host {
					display: block;
				}
				.d2l-typography {
					line-height: 0;
				}
				ol {
					margin: 0;
					padding: 0;
					/* (paragraph separation) 8px + (load more/less border) 1px + (load more/less padding) 8px = 17px */
					margin-bottom: calc(var(--d2l-notes-ol-margin-bottom) - 17px);

					@apply --d2l-notes-ol;
				}
				li {
					display: block;
					margin-top: var(--d2l-notes-note-margin-top);
					margin-bottom: var(--d2l-notes-note-margin-bottom);

					@apply --d2l-notes-li;
				}
				li:first-child {
					margin-top: 0;

					@apply --d2l-notes-li-first;
				}
				li:last-child {
					margin-bottom: 0;

					@apply --d2l-notes-li-last;
				}

				hr {
					/* (paragraph separation) 8px */
					margin-top: calc(var(--d2l-notes-ol-margin-bottom) - 8px);
					margin-bottom: var(--d2l-notes-hr-margin-bottom);

					@apply --d2l-notes-hr;
				}

				.d2l-notes-more-less {
					display: flex;
					width: 100%;
					align-items: center;
					/* load more/less padding (8px) - load more/less border (1px) = 9px */
					margin-bottom: calc(var(--d2l-notes-load-more-margin-bottom) - 9px);

					@apply --d2l-notes-more-less;
				}

				.d2l-notes-load-more-less {
					flex: 0 1 auto;

					@apply --d2l-notes-more-less-button;
				}

				.d2l-notes-more-less-separator {
					flex: 1;
					border-top: solid 1px var(--d2l-color-celestine);

					@apply --d2l-notes-more-less-separator;
				}

				.d2l-notes-enter-note-string,
				.d2l-note-emptystring {
					line-height: 1.4;
					margin-bottom: 0.6rem;
				}
			</style>
			<div class="d2l-typography">
				${notes.length > 0 ? html`
					<ol>${repeat(notes, (note) => html`
						<li>
							<d2l-note
								.id=${note.id ? note.id : ''}
								.user=${note.user}
								.href=${note.href}
								.token=${note.token}
								.showavatar=${typeof note.showAvatar === 'boolean' ? note.showAvatar : true}
								.me=${note.me ? note.me : false}
								.createdat=${note.createdAt}
								.updatedat=${note.updatedAt}
								.text=${note.text}
								.canedit=${note.canEdit ? note.canEdit : false}
								.candelete=${note.canDelete ? note.canDelete : false}
								.private=${note.private ? note.private : false}
								.dateformat=${this.dateformat}
								.contextmenulabel=${note.contextmenulabel}
								.editstring=${this.editstring}
								.deletestring=${this.deletestring}
								.privatelabel=${this.privatelabel}
								.addnotestring=${this.addnotestring}
								.savenotestring=${this.savenotestring}
								.discardnotestring=${this.discardnotestring}
								.editplaceholder=${this.editplaceholder}
							>
								<div slot="description">${this.description(note)}</div>
								<div slot="settings">${this.settings(note)}</div>
							</d2l-note>
						</li>
					`)}
			</ol>` : (this.emptystring === '' ? '' : html`<div class="d2l-body-standard d2l-note-emptystring">${this.emptystring !== undefined || this.enternotestring !== undefined ? this.emptystring || this.enternotestring : this.localize('empty')}</div>`)}

				${hasmore ? html`
				<div
					class="d2l-notes-more-less"
					@click=${this.handleMoreLess}
					@tap=${this.handleMoreLess}
				>
					<div class="d2l-notes-more-less-separator"></div>
					<d2l-button-subtle
						class="d2l-notes-load-more-less"
						text="${(this.hasmore || this.collapsed) ? this.loadmorestring ? this.loadmorestring : this.localize('more') : this.loadlessstring ? this.loadlessstring : this.localize('less')}"
					></d2l-button-subtle>
					<div class="d2l-notes-more-less-separator"></div>
				</div>
				` : null}

				${(hasmore || this.notes.length) && this.cancreate ? html`<hr>` : null}

				${this.cancreate ? html`${notes.length > 0 && this.enternotestring !== undefined ? html`<div class='d2l-notes-enter-note-string'>${this.enternotestring}</div>` : html``}
					<d2l-note-edit new placeholder="${this.editplaceholder}">
						<slot class="d2l-body-standard" name="description" slot="description"><div>${this.description()}</div></slot>
						<div slot="settings">${this.settings()}</div>
					</d2l-note-edit>` : null}
			</div>
		`;
	}

	handleMoreLess() {
		if (this.hasmore || this.collapsed) {
			this.dispatchEvent(new CustomEvent(this.EVENT_LOAD_MORE, {
				bubbles: true,
				composed: true
			}));
			this.collapsed = false;
		} else {
			this.dispatchEvent(new CustomEvent(this.EVENT_LOAD_LESS, {
				bubbles: true,
				composed: true
			}));
			this.collapsed = true;
		}
	}
}
customElements.define('d2l-notes', D2LNotes);
