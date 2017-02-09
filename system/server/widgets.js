const modules = require('../modules/modules');
const database = require('../database');
const isFunction = require('lodash/isFunction');
const uuid = require('uuid-1345').v1;

function renderWidgetTemplates() {
  const widgets = modules.getWidgets();
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
  console.log(modules.getWidgets());
  const w = database
    .get('widgets')
    .map(widgetEntry => {
      const widgetConfig = modules.getWidget(widgetEntry.component);

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

  console.log(w);
  return w;
}

function updateWidget(widget) {
  database.get('widgets').updateById(widget.id, widget).value();
}

module.exports = {
  renderWidgetTemplates,
  getWidgets,
  updateWidget
};
