import '@d2l/user-elements/d2l-user';
import 'd2l-icons/d2l-icon';
import 'd2l-icons/tier1-icons';
import 'd2l-dropdown/d2l-dropdown-more';
import 'd2l-dropdown/d2l-dropdown-menu';
import 'd2l-menu/d2l-menu';
import 'd2l-menu/d2l-menu-item';
import 'd2l-more-less/d2l-more-less';
import 'd2l-colors/d2l-colors';
import 'd2l-users/components/d2l-profile-image';
import './d2l-note-edit';
/**
 * Import LitElement base class, html helper function,
 * and TypeScript decorators
 **/
import {
	customElement, html, LitElement, property
} from 'lit-element';

import { LocalizeMixin, LocalizeMixinProto } from './mixins/localize-mixin';

import { D2LTypographyMixin } from './mixins/d2l-typography-mixin';
import { repeat } from 'lit-html/directives/repeat';

/**
 * d2l-note component created with lit-element
 *
 * # Usage
 * ```html
 * <d2l-note
 *	 id="note"
 *	 user='{"name":"Username","pic":{"url":"avatar.png"}}'
 *	 token="foozleberries"
 *	 showavatar
 *	 me
 *	 createdat="2019-04-23T17:08:33.839Z"
 *	 updatedat="2019-04-24T17:08:33.839Z"
 *	 text="A Note"
 *	 canedit
 *	 candelete
 *	 private
 *	 dateformat="medium"
 *	 contextmenulabel="Context Menu"
 *	 editstring="Edit Note"
 *	 deletestring="Delete Note"
 *	 privatelabel="Private"
 *	 addnotestring="Add"
 *	 savenotestring="Save"
 *	 discardnotestring="Discard"
 *	 editplaceholder="Placeholder for d2l-note-edit"
 * >
 *	 <div slot="description">Description for d2l-note-edit</div>
 *	 <div slot="settings">Settings for d2l-note-edit</div>
 * </d2l-note>
 * ```
 */
@customElement('d2l-note')
export class D2LNote extends D2LTypographyMixin(LocalizeMixin(LitElement)) {

	/**
	 * Username and avatar to show
	 * user.pic.url = <avatar url>
	 * user.pic.requireTokenAuth <true/false>
	 * user.name = <user name to show>
	 */
	@property({ type: Object })
	user?: {
		pic?: {
			url: string;
			requireTokenAuth?: boolean;
		};
		name?: string;
		href?: string;
	};

	/**
	 * Token to use in request when user.pic.requireTokenAuth is true
	 */
	@property({ type: String })
	token?: string;

	/**
	 * show avatar and username if true
	 */
	@property({ type: Boolean })
	showavatar = false;

	/**
	 * Compact view. Removes padding
	 */
	@property({ type: Boolean })
	compact = false;

	/**
	 * ISO datetime string of note creation
	 */
	@property({ type: String })
	createdat?: string;

	/**
	 * ISO datetime string of note update
	 */
	@property({ type: String })
	updatedat?: string;

	/**
	 * Text of note
	 */
	@property({ type: String })
	text?: string;

	/**
	 * d2l-note-edit placeholder to show when editting
	 */
	@property({ type: String })
	editplaceholder: string = '';

	/**
	 * Indicates note user is the current user
	 */
	@property({ type: Boolean })
	me: boolean = false;

	/**
	 * Indicates this note is private
	 */
	@property({ type: Boolean, reflect: true })
	private: boolean = false;

	/**
	 * Indicates this note can be editted by the current user
	 */
	@property({ type: Boolean })
	canedit: boolean = false;

	/**
	 * Indicates this note can be deleted by the current user
	 */
	@property({ type: Boolean })
	candelete: boolean = false;

	/**
	 * d2l-intl date format to user
	 */
	@property({ type: String })
	dateformat: string = 'medium';

	/**
	 * Indicates whether the note is beting editted
	 * Shows a d2l-note-edit component if true
	 */
	@property({ type: Boolean })
	editting: boolean = false;

	/**
	 * Label for the edit/delete context menu
	 */
	@property({ type: String })
	contextmenulabel?: string;

	/**
	 * Label of edit menu item
	 */
	@property({ type: String })
	editstring?: string;

	/**
	 * Label of delete menu item
	 */
	@property({ type: String })
	deletestring?: string;

	/**
	 * Label of private indicator
	 */
	@property({ type: String })
	privatelabel?: string;

	/**
	 * Text of 'Add' button in d2l-note-edit
	 */
	@property({ type: String })
	addnotestring?: string;

	/**
	 * Text of 'Save' button in d2l-note-edit
	 */
	@property({ type: String })
	savenotestring?: string;

	/**
	 * Label of 'Discard' button in d2l-note-edit
	 */
	@property({ type: String })
	discardnotestring?: string;

	/**
	 * Fired when delete menu item is tapped
	 * @event
	 */
	static EVENT_DELETE = 'd2l-note-delete';

	__langResources: {
		[key: string]: {
			[key in 'SubtextEdited' | 'me' | 'contextMenu' | 'edit' | 'delete' | 'private']: string;
		};
	} = {
		'en': {
			'SubtextEdited': '{0} (Edited)',
			'me': 'Me',
			'contextMenu': 'Context Menu',
			'edit': 'Edit',
			'delete': 'Delete',
			'private': 'Private'
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
		const proto: LocalizeMixinProto = this.constructor.prototype;
		this.checkLocalizationCache(proto);

		const namespace = `d2l-note:${lang}`;

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
		const mapToParagraphs = (text: string) => {
			const lines = text.split('\n');
			return repeat(
				lines,
				(paragraph, index) => html`<div class="${`paragraph ${index === 0 ? 'first' : ''} ${index === lines.length - 1 ? 'last' : ''}`}">${paragraph}</div>`
			);
		};
		function convertText(text: string) {
			return html`
				<d2l-more-less height="4.7rem">
					<div class="d2l-note-text d2l-body-standard">${mapToParagraphs(text)}</div>
				</d2l-more-less>`;
		}
		/**
		 * Use JavaScript expressions to include property values in
		 * the element template.
		 */
		const imageUrl = (this.showavatar && this.user && this.user.pic) ? this.user.pic.url : undefined;
		const useImageAuthentication = !!(this.showavatar && this.user && this.user.pic && this.user.pic.requireTokenAuth);
		const userName = this.showavatar ? this.me ? this.localize('me') : this.user ? this.user.name : undefined : undefined;

		const createdAtDate = this.createdat ? new Date(this.createdat) : null;
		const date = createdAtDate ? this.formatDateTime(createdAtDate, { format: this.dateformat || 'medium' }) : undefined;
		// Need this step because the formatter doesn't parse the time when using a custom format
		const dateTime = createdAtDate ? this.formatTime(createdAtDate, { format: date }) : undefined;

		const subText = this.updatedat ? this.localize('SubtextEdited', dateTime) : dateTime;
		const showDropdown = this.canedit || this.candelete;
		return html`
			<style>${D2LNote.d2lTypographyStyle}</style>
			<style>
				:host {
					--d2l-note-user-text-spacing: 12px;
					--d2l-note-paragraph-spacing: 0.5rem;
					--d2l-note-padding-vertical: 0.5rem;
					--d2l-note-padding-horizontal: 1rem;
					--d2l-note-margin-horizontal: -1rem;

					--d2l-note-local-context-menu-rtl: {
						@apply --d2l-note-context-menu-rtl;
					};

					--d2l-note-local-private-indicator-rtl: {
						@apply --d2l-note-private-indicator-rtl;
					};
				}
				:host([compact]) {
					--d2l-note-user-text-spacing: 8px;
					--d2l-note-padding-vertical: 0;
					--d2l-note-padding-horizontal: 0;
					--d2l-note-margin-horizontal: 0;
				}
				:host {
					position: relative;
					display: flex;
					line-height: 0;
					padding: var(--d2l-note-padding-vertical) var(--d2l-note-padding-horizontal);
					margin: 0 var(--d2l-note-margin-horizontal);
				}
				:host([private]) {
					background-color: var(--d2l-color-regolith);
				}
				.d2l-note-main {
					flex: 1;
					line-height: 0;
					max-width: 100%;
					position: relative;
				}
				.d2l-note-top {
					display: flex;
					justify-content: space-between;
					align-items: flex-start;
				}

				d2l-user {
					margin-bottom: var(--d2l-note-user-text-spacing);

					@apply --d2l-note-user;
				}

				.d2l-note-text {
					position: relative;
					max-width: 100%;

					@apply --d2l-note-text;
				}
				.paragraph {
					margin: var(--d2l-note-paragraph-spacing) 0;
					word-break: break-word; /* Not universally supported */
					word-wrap: break-word;  /* Alternate for above */
					overflow-wrap: anywhere; /* Overrides word-* rules, where supported */

					@apply --d2l-note-paragraph;
				}
				.paragraph.first {
					margin-top: 0;
				}
				.paragraph.last {
					margin-bottom: 0;
				}

				d2l-dropdown-more {
					@apply --d2l-note-context-menu;
				}

				:host(:dir(rtl)) d2l-dropdown-more {
					@apply --d2l-note-local-context-menu-rtl;
				}
				:host-context([dir="rtl"]) > .d2l-note-main d2l-dropdown-more {
					@apply --d2l-note-local-context-menu-rtl;
				}

				.d2l-note-private-indicator {
					margin: 8px;
					@apply --d2l-note-private-indicator;
				}

				:host(:dir(rtl)) .d2l-note-private-indicator {
					@apply --d2l-note-local-private-indicator-rtl;
				}
				:host-context([dir="rtl"]) > .d2l-note-main .d2l-note-private-indicator {
					@apply --d2l-note-local-private-indicator-rtl;
				}

				.d2l-note-text-container {
					display: flex;
					position: relative;
					max-width: 100%;
				}

				d2l-more-less {
					flex: 1;
					position: relative;
					max-width: 100%;
				}

				.skeleton {
					background: var(--d2l-color-sylvite);
					border-radius: 6px;
					@apply --d2l-note-skeleton;
				}

				.skeleton.skeleton-avatar {
					width: 42px;
					height: 42px;
				}

				.skeleton-user {
					display: flex;
					justify-content: space-between;
					width: 197px;
					margin-bottom: var(--d2l-note-user-text-spacing);

					@apply --d2l-note-user;
					@apply --d2l-note-skeleton-user;
				}

				.skeleton-user .skeleton-info-container {
					display: flex;
					flex-direction: column;
					justify-content: center;
				}

				.skeleton-user .skeleton-name {
					width: 80px;
					/* 20px = user name/subtext line height */
					height: 20px;
					margin-bottom: 5px;
				}

				.skeleton-user .skeleton-subtext {
					width: 140px;
					height: 20px;
				}

				.d2l-note-text-skeleton {
					@apply --d2l-body-standard-text;
					width: 100%;

					@apply --d2l-note-text;
					@apply --d2l-note-skeleton-text;
				}
			</style>
			<div class="d2l-note-main d2l-typography">
				<div class="d2l-note-top">
					${this.user ? html`
						<d2l-user
							.imageUrl="${imageUrl}"
							.imageToken="${useImageAuthentication ? this.token : ''}"
							.name="${userName}"
							.subText="${subText}"
							.useImageAuthentication=${useImageAuthentication}
							.shouldHideImage=${!this.showavatar}
							>${this.user.href ? html`<d2l-profile-image
									slot="avatar"
									href="${this.user.href}"
									token="${this.token}"
									medium
								></d2l-profile-image>` : null }</d2l-user>` : html`
						<div class="d2l-note-user-skeleton skeleton-user">
							<div class="skeleton skeleton-avatar"></div>
							<div class="skeleton-info-container">
								<div class="skeleton skeleton-name"></div>
								<div class="skeleton skeleton-subtext"></div>
							</div>
						</div>`}
					${showDropdown ? html`
						<d2l-dropdown-more text="${this.contextmenulabel ? this.contextmenulabel : this.localize('contextMenu')}">
							<d2l-dropdown-menu>
								<d2l-menu label="${this.contextmenulabel ? this.contextmenulabel : this.localize('contextMenu')}">
									${this.canedit && !this.editting ? html`<d2l-menu-item
										text="${this.editstring ? this.editstring : this.localize('edit')}"
										@d2l-menu-item-select=${this.editSelectHandler}
									></d2l-menu-item>` : null }
									${this.candelete ? html`<d2l-menu-item
										text="${this.deletestring ? this.deletestring : this.localize('delete')}"
										@d2l-menu-item-select=${this.deleteSelectHandler}
									></d2l-menu-item>` : null }
								</d2l-menu>
							</d2l-dropdown-menu>
						</d2l-dropdown-more>` : null }
				</div>
				<div class="d2l-note-text-container">
					${this.editting ? html`
						<d2l-note-edit
							id="${this.id}"
							placeholder="${this.editplaceholder}"
							value="${this.text}"
							expanded
							.addnotestring=${this.addnotestring}
							.savenotestring=${this.savenotestring}
							.discardnotestring=${this.discardnotestring}
							@d2l-note-edit-finished=${this._handleFinished}
						>
							<slot name="description" slot="description"></slot>
							<slot name="settings" slot="settings"></slot>
						</d2l-note-edit>` : this.text ? convertText(this.text) : html`
						<div class="d2l-note-text-skeleton skeleton">&nbsp;</div>`}
					${!this.editting && this.private ? html`<d2l-icon
						class="d2l-note-private-indicator"
						icon="d2l-tier1:visibility-hide"
						aria-label="${this.privatelabel ? this.privatelabel : this.localize('private')}"
					></d2l-icon>` : null }
				</div>
			</div>
		`;
	}

	editSelectHandler() {
		this.editting = true;
	}

	_handleFinished() {
		this.editting = false;
	}

	deleteSelectHandler() {
		this.dispatchEvent(new CustomEvent(D2LNote.EVENT_DELETE, {
			bubbles: true,
			composed: true,
			detail: {
				id: this.id
			}
		}));
	}
}
