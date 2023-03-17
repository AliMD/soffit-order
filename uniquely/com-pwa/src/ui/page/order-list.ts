import {
  customElement,
  css,
  html,
  LocalizeMixin,
  SignalMixin,
  AlwatrBaseElement,
  UnresolvedMixin,
  state,
  ScheduleUpdateToFrameMixin,
} from '@alwatr/element';
import {finiteStateMachineConsumer} from '@alwatr/fsm';
import {message} from '@alwatr/i18n';
import {redirect} from '@alwatr/router';
import {Order} from '@alwatr/type/customer-order-management.js';
import '@alwatr/ui-kit/button/button.js';
import {IconBoxContent} from '@alwatr/ui-kit/card/icon-box.js';

import {topAppBarContextProvider} from '../../manager/context.js';
import {OrderListFsm} from '../../manager/controller/order-list.js';
import '../stuff/order-list.js';


import type {ClickSignalType} from '@alwatr/type';


declare global {
  interface HTMLElementTagNameMap {
    'alwatr-page-order-list': AlwatrPageOrderList;
  }
}

const buttons = {
  backToHome: {
    icon: 'arrow-back-outline',
    flipRtl: true,
    clickSignalId: 'back_to_home_click_event',
  },
  reload: {
    icon: 'reload-outline',
    // flipRtl: true,
    clickSignalId: 'order_list_reload_click_event',
  },
  newOrder: {
    icon: 'add-outline',
    clickSignalId: 'order_list_new_order_click_event',
  },
  orderDetail: {
    clickSignalId: 'order_list_order_detail_click_event',
  },
} as const;

/**
 * List of all orders.
 */
@customElement('alwatr-page-order-list')
export class AlwatrPageOrderList extends ScheduleUpdateToFrameMixin(
    UnresolvedMixin(LocalizeMixin(SignalMixin(AlwatrBaseElement))),
) {
  static override styles = css`
    :host {
      display: block;
      padding: var(--sys-spacing-track) calc(2 * var(--sys-spacing-track));
      box-sizing: border-box;
      min-height: 100%;
    }

    alwatr-order-list {
      transform: opacity var(--sys-motion-duration-small);
    }

    :host([state='reloading']) alwatr-order-list {
      opacity: var(--sys-surface-disabled-opacity);
    }
  `;

  protected fsm =
    finiteStateMachineConsumer<OrderListFsm>('order_list_fsm_' + this.ali, 'order_list_fsm');

  @state()
    gotState = this.fsm.getState().target;

  override connectedCallback(): void {
    super.connectedCallback();

    this._addSignalListener(this.fsm.defineSignals([
      {
        callback: (): void => {
          this.gotState = this.fsm.getState().target;
        },
      },
      {
        signalId: buttons.reload.clickSignalId,
        transition: 'request_context',
      },
      {
        signalId: buttons.newOrder.clickSignalId,
        callback: (): void => {
          redirect({
            sectionList: ['new-order'],
          });
        },
      },
      {
        signalId: buttons.orderDetail.clickSignalId,
        callback: (event: ClickSignalType<Order>): void => {
          redirect({sectionList: ['order-detail', event.detail.id]});
        },
      },
    ]));
  }

  override render(): unknown {
    this._logger.logMethod('render');
    return this.fsm.render({
      pending: () => {
        topAppBarContextProvider.setValue({
          headlineKey: 'loading',
          startIcon: buttons.backToHome,
        });
        const content: IconBoxContent = {
          tinted: 1,
          icon: 'cloud-download-outline',
          headline: message('loading'),
        };
        return html`<alwatr-icon-box .content=${content}></alwatr-icon-box>`;
      },

      contextError: () => {
        topAppBarContextProvider.setValue({
          headlineKey: 'page_order_list_headline',
          startIcon: buttons.backToHome,
          endIconList: [buttons.reload],
        });
        const content: IconBoxContent = {
          icon: 'cloud-offline-outline',
          tinted: 1,
          headline: message('fetch_failed_headline'),
          description: message('fetch_failed_description'),
        };
        return html`
          <alwatr-icon-box .content=${content}></alwatr-icon-box>
          <alwatr-button .icon=${buttons.reload.icon} .clickSignalId=${buttons.reload.clickSignalId}>
            ${message('retry')}
          </alwatr-button>
        `;
      },

      reloading: 'list',

      list: () => {
        topAppBarContextProvider.setValue({
          headlineKey: 'page_order_list_headline',
          startIcon: buttons.backToHome,
          endIconList: [buttons.newOrder, {...buttons.reload, disabled: this.gotState === 'reloading'}],
        });
        return html`<alwatr-order-list
          .content=${this.fsm.getContext().orderStorage}
          .orderClickSignalId=${buttons.orderDetail.clickSignalId}
        ></alwatr-order-list>`;
      },
    });
  }
}
