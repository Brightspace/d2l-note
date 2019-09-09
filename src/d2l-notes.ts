import 'd2l-button/d2l-button-subtle';
import 'd2l-colors/d2l-colors';
import './d2l-note';

/**
 * Import LitElement base class, html helper function,
 * and TypeScript decorators
 **/
import {
	customElement, html, LitElement, property, TemplateResult
} from 'lit-element';

import { D2LTypographyMixin } from './mixins/d2l-typography-mixin';
import { langResources } from './lang';
import { LocalizeMixin } from './mixins/localize-mixin';
import { repeat } from 'lit-html/directives/repeat';

interface INote {
	id?: string;
	user: {
		name: string;
		pic: {
			url: string;
			requireTokenAuth?: boolean;
		};
	};
	href: string;
	token: string;
	showAvatar: boolean;
	me: boolean;
	createdAt: string;
	updatedAt: string;
	text: string;
	canEdit: boolean;
	canDelete: boolean;
	private: boolean;
	contextmenulabel: string;
}

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
@customElement('d2l-notes')
export class D2LNotes extends D2LTypographyMixin(LocalizeMixin(LitElement)) {

	/**
	 * Array of notes to pass to d2l-note elements
	 */
	@property({ type: Array })
	notes: INote[] = [];

	/**
	 * Indicates this user can create new notes
	 */
	@property({ type: Boolean })
	cancreate: boolean = false;

	/**
	 * d2l-note-edit placeholder to show when creating
	 */
	@property({ type: String })
	editplaceholder: string = '';

	/**
	 * TemplateResult containing description for d2l-note's in edit state and d2l-note-edit
	 */
	@property({ type: Object })
	description: (ctx?: INote) => TemplateResult = () => html`<div></div>`;

	/**
	 * TemplateResult containing settings for d2l-note's in edit state and d2l-note-edit
	 */
	@property({ type: Object })
	settings: (ctx?: INote) => TemplateResult = () => html`<div></div>`;

	/**
	 * Show the loadmore button regardless of number of items
	 */
	@property({ type: Boolean })
	hasmore: boolean = false;

	/**
	 * Load more/less collapsed state
	 */
	@property({ type: Boolean })
	collapsed: boolean = true;

	/**
	 * Number of items to show before showing the load more button
	 */
	@property({ type: Number })
	collapsedsize: number = 4;

	/**
	 * dateformat in d2l-note's
	 */
	@property({ type: String })
	dateformat?: string;

	/**
	 * override loadmore button text
	 */
	@property({ type: String })
	loadmorestring?: string;

	/**
	 * override loadless button text
	 */
	@property({ type: String })
	loadlessstring?: string;

	/**
	 * editstring in d2l-note's
	 */
	@property({ type: String })
	editstring?: string;

	/**
	 * deletestring in d2l-note's
	 */
	@property({ type: String })
	deletestring?: string;

	/**
	 * privatelabel in d2l-note's
	 */
	@property({ type: String })
	privatelabel?: string;

	/**
	 * addnotestring in d2l-note-edit
	 */
	@property({ type: String })
	addnotestring?: string;

	/**
	 * savenotestring in d2l-note's
	 */
	@property({ type: String })
	savenotestring?: string;

	/**
	 * discardnotestring in d2l-note's and d2l-note-edit
	 */
	@property({ type: String })
	discardnotestring?: string;

	/**
	 * string to show when there are no notes to show. Set to '' to not show anything
	 */
	@property({ type: String })
	emptystring?: string;

	/**
	 * label for the 'enter notes' area, overridden by emptystring if there are no existing notes. Does not render if undefined
	 */
	@property({ type: String })
	enternotestring?: string;

	/**
	 * Fired when load more is tapped
	 * @event
	 */
	static EVENT_LOAD_MORE = 'd2l-notes-load-more';

	/**
	 * Fired when load less is tapped
	 * @event
	 */
	static EVENT_LOAD_LESS = 'd2l-notes-load-less';

	__langResources = langResources;

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

		const namespace = `d2l-notes:${lang}`;

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
		const hasmore = this.hasmore || this.notes.length > this.collapsedsize;
		const notes = this.notes && this.collapsed ? this.notes.slice(0, this.collapsedsize) : this.notes;
		/**
		 * Use JavaScript expressions to include property values in
		 * the element template.
		 */
		return html`
			<style>${D2LNotes.d2lTypographyStyle}</style>
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
					line-height: 1;
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
			this.dispatchEvent(new CustomEvent(D2LNotes.EVENT_LOAD_MORE, {
				bubbles: true,
				composed: true
			}));
			this.collapsed = false;
		} else {
			this.dispatchEvent(new CustomEvent(D2LNotes.EVENT_LOAD_LESS, {
				bubbles: true,
				composed: true
			}));
			this.collapsed = true;
		}
	}
}
