const database = require('../database');
const isFunction = require('lodash/isFunction');
const uuid = require('uuid-1345').v1;

let moduleRegistry = null;

function setupWidgetSystem(newModuleRegistry) {
  moduleRegistry = newModuleRegistry;
}

function renderWidgetTemplates() {
  const widgets = moduleRegistry.getWidgets();
  let render = '';

  Object.keys(widgets).forEach(widgetKey => {
    let renderedWidget;
    if (isFunction(widgets[widgetKey].content)) {
      renderedWidget = widgets[widgetKey].content();
    } else {
      renderedWidget = widgets[widgetKey].content;
    }

    render += `
      <!-- Start Template: ${widgetKey}-->
      ${renderedWidget}
      <!-- End Template: ${widgetKey}-->
    `;
  });

  return render;
}

function getWidgets() {
  const w = database
    .get('widgets')
    .map(widgetEntry => {
      const widgetConfig = moduleRegistry.getWidget(widgetEntry.component);

      return {
        id: widgetEntry.id,
        config: {
          id: widgetConfig.id,
          name: widgetConfig.name,
          componentName: widgetConfig.componentName,
          moduleId: widgetConfig.moduleId,
          settingsTypes: widgetConfig.settingsTypes
        },
        size: widgetEntry.size,
        settings: widgetEntry.settings,
        data: widgetConfig.onDataRequest(widgetEntry.settings)
      };
    })
    .value();

  return w;
}

function updateWidget(widget) {
  database.get('widgets').updateById(widget.id, widget).value();
}

module.exports = {
  setupWidgetSystem,
  renderWidgetTemplates,
  getWidgets,
  updateWidget
};
