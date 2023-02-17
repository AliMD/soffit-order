import {html, customElement} from '@alwatr/element';
import '@alwatr/font/vazirmatn.css';
import {AlwatrPwaElement} from '@alwatr/pwa-helper/pwa-element.js';
import '@alwatr/ui-kit/style/mobile-only.css';
import '@alwatr/ui-kit/style/theme/color.css';
import '@alwatr/ui-kit/style/theme/palette-85.css';

import './director/index.js';

import type {RoutesConfig} from '@alwatr/router';

declare global {
  interface HTMLElementTagNameMap {
    'alwatr-pwa': AlwatrPwa;
  }
}

/**
 * Alwatr PWA Root Element
 */
@customElement('alwatr-pwa')
class AlwatrPwa extends AlwatrPwaElement {
  protected override _routesConfig: RoutesConfig = {
    routeId: (routeContext) => routeContext.sectionList[0]?.toString(),
    templates: {
      'home': () => {
        import('./page-home.js');
        return html`<alwatr-page-home>...</alwatr-page-home>`;
      },
      '_404': () => {
        import('./page-404.js');
        return html`<alwatr-page-404>...</alwatr-page-404>`;
      },
      'orders': () => {
        import('./page-order-list.js');
        return html`<alwatr-page-order-list></alwatr-page-order-list>`;
      },
      'products': (routeContext) => {
        import('./page-product-list.js');
        return html`<alwatr-page-product-list
          .storageName=${routeContext.sectionList[1]?.toString()}
        ></alwatr-page-product-list>`;
      },
    },
  };
}