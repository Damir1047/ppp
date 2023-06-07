import ppp from '../../ppp.js';
import { css, html } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { formatDate } from '../../lib/intl.js';
import '../badge.js';
import '../button.js';
import '../table.js';

export const extensionsPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        Список дополнений
        <ppp-button
          appearance="primary"
          slot="controls"
          @click="${() =>
            ppp.app.mountPage('new-extension-modal', {
              title: 'Установить дополнение',
              size: 'large'
            })}"
        >
          Установить дополнение
        </ppp-button>
      </ppp-page-header>
      <ppp-table
        @cleanup="${(x, c) =>
          x.cleanupFromListing({
            pageName: 'extension-manage',
            documentId: c.event.detail.datum._id
          })}"
        :columns="${() => [
          {
            label: 'Название'
          },
          {
            label: 'Автор'
          },
          {
            label: 'Дата создания'
          },
          {
            label: 'Последнее изменение'
          },
          {
            label: 'Версия'
          },
          {
            label: 'Действия'
          }
        ]}"
        :rows="${(x) =>
          x.documents.map((datum) => {
            return {
              datum,
              cells: [
                html`<a
                  class="link"
                  @click="${() => {
                    ppp.app.navigate({
                      page: 'extension-manage',
                      document: datum._id
                    });

                    return false;
                  }}"
                  href="?page=${datum.page}&extension=${datum._id}"
                >
                  ${datum.title}
                </a>`,
                datum.author,
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                html`
                  <ppp-badge appearance="green">
                    ${() => datum.version}
                  </ppp-badge>
                `,
                html`
                  <div class="control-line">
                    <ppp-button
                      class="xsmall"
                      @click="${() => {
                        ppp.app.extension = datum._id;

                        ppp.app.navigate({
                          page: datum.page,
                          extension: datum._id
                        });

                        return false;
                      }}"
                    >
                      Открыть дополнение
                    </ppp-button>
                    <ppp-button
                      action="cleanup"
                      :datum="${() => datum}"
                      class="xsmall"
                    >
                      Удалить
                    </ppp-button>
                  </div>
                `
              ]
            };
          })}"
      >
      </ppp-table>
    </form>
  </template>
`;

export const extensionsPageStyles = css`
  ${pageStyles}
`;

export class ExtensionsPage extends Page {
  collection = 'extensions';

  async populate() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .find({
          removed: { $ne: true }
        })
        .sort({ updatedAt: -1 });
    };
  }
}

export default ExtensionsPage.compose({
  template: extensionsPageTemplate,
  styles: extensionsPageStyles
}).define();
