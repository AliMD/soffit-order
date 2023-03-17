import {customElement, html, state, UnresolvedMixin} from '@alwatr/element';
import {finiteStateMachineConsumer} from '@alwatr/fsm';
import {message} from '@alwatr/i18n';
import {redirect} from '@alwatr/router';
import {tileQtyStep} from '@alwatr/type/customer-order-management.js';
import {IconBoxContent} from '@alwatr/ui-kit/card/icon-box.js';

import {topAppBarContextProvider} from '../../manager/context.js';
import {AlwatrOrderDetailBase} from '../stuff/order-detail-base.js';
import '../stuff/select-product.js';

import type {NewOrderFsm} from '../../manager/controller/new-order.js';
import type {Order, OrderShippingInfo} from '@alwatr/type/customer-order-management.js';


declare global {
  interface HTMLElementTagNameMap {
    'alwatr-page-new-order': AlwatrPageNewOrder;
  }
}

const buttons = {
  back: {
    icon: 'arrow-back-outline',
    flipRtl: true,
    clickSignalId: 'page_new_order_back_click_event',
  },
  backToHome: {
    icon: 'arrow-back-outline',
    flipRtl: true,
    clickSignalId: 'back_to_home_click_event',
  },
  editItems: {
    icon: 'create-outline',
    clickSignalId: 'page_new_order_edit_items_click_event',
  },
  submit: {
    icon: 'checkmark-outline',
    clickSignalId: 'page_new_order_submit_click_event',
  },
  edit: {
    icon: 'create-outline',
    clickSignalId: 'page_new_order_edit_click_event',
  },
  submitFinal: {
    icon: 'checkmark-outline',
    clickSignalId: 'page_new_order_submit_final_click_event',
  },
  submitShippingForm: {
    icon: 'checkmark-outline',
    clickSignalId: 'page_new_order_submit_shipping_form_click_event',
  },
  editShippingForm: {
    icon: 'checkmark-outline',
    clickSignalId: 'page_new_order_edit_shipping_form_click_event',
  },
  newOrder: {
    icon: 'add-outline',
    clickSignalId: 'page_new_order_new_order_click_event',
  },
  detail: {
    icon: 'information-outline',
    clickSignalId: 'page_new_order_detail_click_event',
  },
  tracking: {
    icon: 'chatbox-outline',
    clickSignalId: 'page_new_order_tracking_click_event',
  },
  reload: {
    icon: 'reload-outline',
    // flipRtl: true,
    clickSignalId: 'order_list_reload_click_event',
  },
  retry: {
    icon: 'reload-outline',
    clickSignalId: 'page_new_order_retry_click_event',
  },
} as const;

/**
 * Alwatr Customer Order Management Order Form Page
 */
@customElement('alwatr-page-new-order')
export class AlwatrPageNewOrder extends UnresolvedMixin(AlwatrOrderDetailBase) {
  protected fsm = finiteStateMachineConsumer<NewOrderFsm>('new_order_fsm_' + this.ali, 'new_order_fsm');
  @state()
    gotState = this.fsm.getState().target;

  override connectedCallback(): void {
    super.connectedCallback();

    this._addSignalListener(
        this.fsm.defineSignals([
          {
            signalId: buttons.submit.clickSignalId,
            transition: 'submit',
          },
          {
            signalId: buttons.submitShippingForm.clickSignalId,
            transition: 'submit',
          },
          {
            signalId: buttons.edit.clickSignalId,
            transition: 'back',
          },
          {
            signalId: buttons.submitFinal.clickSignalId,
            transition: 'final_submit',
          },
          {
            signalId: buttons.editItems.clickSignalId,
            transition: 'final_submit',
          },
          {
            signalId: buttons.retry.clickSignalId,
            transition: 'final_submit',
          },
          {
            signalId: buttons.editShippingForm.clickSignalId,
            transition: 'edit_shipping',
          },
          {
            signalId: buttons.tracking.clickSignalId,
            callback: (): void => {
              const orderId = this.fsm.getContext().registeredOrderId as string;
              this.fsm.transition('new_order');
              redirect({sectionList: ['order-tracking', orderId]});
            },
          },
          {
            signalId: buttons.detail.clickSignalId,
            callback: (): void => {
              const orderId = this.fsm.getContext().registeredOrderId as string;
              this.fsm.transition('new_order');
              redirect({sectionList: ['order-detail', orderId]});
            },
          },
          {
            signalId: buttons.newOrder.clickSignalId,
            callback: (): void => {
              this.fsm.transition('new_order');
              redirect('/new-order/');
            },
          },
        ]),
    );
  }

  protected override render(): unknown {
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

      edit: () => {
        topAppBarContextProvider.setValue({
          headlineKey: 'page_new_order_headline',
          startIcon: buttons.backToHome,
        });
        const order = this.fsm.getContext().order;
        return [
          this.render_part_item_list(order.itemList ?? [], this.fsm.getContext().productStorage, true),
          html`
            <div class="btn-container">
              <alwatr-button .icon=${buttons.editItems.icon} .clickSignalId=${buttons.editItems.clickSignalId}>
                ${message('page_new_order_edit_items')}
              </alwatr-button>
            </div>
          `,
          this.render_part_shipping_info(order.shippingInfo),
          html`
            <div class="btn-container">
              <alwatr-button
                .icon=${buttons.editShippingForm.icon}
                .clickSignalId=${buttons.editShippingForm.clickSignalId}
              >
                ${message('page_new_order_shipping_edit')}
              </alwatr-button>
            </div>
          `,
          this.render_part_summary(order),
          html`
            <div class="submit-container">
              <alwatr-button
                .icon=${buttons.submit.icon}
                .clickSignalId=${buttons.submit.clickSignalId}
                ?disabled=${!this.fsm.getContext().order.itemList?.length}
                >${message('page_new_order_submit')}
              </alwatr-button>
            </div>
          `,
        ];
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

      reloading: 'selectProduct',
      selectProduct: () => {
        topAppBarContextProvider.setValue({
          headlineKey: 'page_new_order_headline',
          startIcon: buttons.backToHome,
        });
        return [
          html`<alwatr-select-product></alwatr-select-product>`,
          html`
            <div class="btn-container">
              <alwatr-button
                elevated
                .icon=${buttons.submit.icon}
                .clickSignalId=${buttons.submit.clickSignalId}
                ?disabled=${!this.fsm.getContext().order.itemList?.length}
                >${message('select_product_submit_button')}
              </alwatr-button>
            </div>
          `,
        ];
      },

      shippingForm: () => {
        const order = this.fsm.getContext().order;
        return [
          this.render_part_item_list(order.itemList ?? [], this.fsm.getContext().productStorage, false),
          this.render_part_shipping_form(order.shippingInfo as Partial<OrderShippingInfo>),
          html`
            <div class="btn-container">
              <alwatr-button
                .icon=${buttons.submitShippingForm.icon}
                .clickSignalId=${buttons.submitShippingForm.clickSignalId}
              >
                ${message('page_new_order_shipping_submit')}
              </alwatr-button>
            </div>
          `,
        ];
      },

      review: () => {
        const order = this.fsm.getContext().order as Order;
        return [
          this.render_part_status(order),
          this.render_part_item_list(order.itemList, this.fsm.getContext().productStorage),
          this.render_part_shipping_info(order.shippingInfo),
          this.render_part_summary(order),
          html`
            <div class="submit-container">
              <alwatr-button .icon=${buttons.edit.icon} .clickSignalId=${buttons.edit.clickSignalId}>
                ${message('page_new_order_edit')}
              </alwatr-button>
              <alwatr-button .icon=${buttons.submitFinal.icon} .clickSignalId=${buttons.submitFinal.clickSignalId}>
                ${message('page_new_order_submit_final')}
              </alwatr-button>
            </div>
          `,
        ];
      },

      submitting: () => {
        const content: IconBoxContent = {
          headline: message('page_new_order_submitting_message'),
          icon: 'cloud-upload-outline',
          tinted: 1,
        };
        return html`<alwatr-icon-box .content=${content}></alwatr-icon-box>`;
      },

      submitSuccess: () => {
        const content: IconBoxContent = {
          headline: message('page_new_order_submit_success_message'),
          icon: 'cloud-done-outline',
          tinted: 1,
        };
        return [
          html`<alwatr-icon-box .content=${content}></alwatr-icon-box>`,
          html`
            <div class="submit-container">
              <alwatr-button .icon=${buttons.detail.icon} .clickSignalId=${buttons.detail.clickSignalId}>
                ${message('page_new_order_detail_button')}
              </alwatr-button>
              <alwatr-button .icon=${buttons.newOrder.icon} .clickSignalId=${buttons.newOrder.clickSignalId}>
                ${message('page_new_order_headline')}
              </alwatr-button>
            </div>
          `,
        ];
      },

      submitFailed: () => {
        const content: IconBoxContent = {
          headline: message('page_new_order_submit_failed_message'),
          icon: 'cloud-offline-outline',
          tinted: 1,
        };
        return [
          html`<alwatr-icon-box .content=${content}></alwatr-icon-box>`,
          html`
            <div class="submit-container">
              <alwatr-button .icon=${buttons.retry.icon} .clickSignalId=${buttons.retry.clickSignalId}>
                ${message('page_new_order_retry_button')}
              </alwatr-button>
            </div>
          `,
        ];
      },
    });
  }

  protected calculateOrderPrice(): void {
    const order = this.fsm.getContext().order;
    let totalPrice = 0;
    let finalTotalPrice = 0;
    for (const item of order.itemList ?? []) {
      totalPrice += item.price * item.qty * tileQtyStep;
      finalTotalPrice += item.finalPrice * item.qty * tileQtyStep;
    }
    order.totalPrice = Math.round(totalPrice);
    order.finalTotalPrice = Math.round(finalTotalPrice);
  }
}
