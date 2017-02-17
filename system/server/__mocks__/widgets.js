const widgets = {};

// This is a mock for a template loader. Doesn't matter what the template loads.
function renderWidgetTemplates() {
  return '<WIDGET TEMPLATES>';
}

// This returns an array of widgets.
function getWidgets() {
  return new Array(20).map(() => ({
    id: 'widget-id',
    config: {
      id: 'widget-id',
      name: 'widget-name',
      componentName: 'widget-component-name',
      moduleId: 'widget-module-id',
      settingsTypes: {}
    },
    size: {},
    settings: {},
    data: {}
  }));
}

widgets.renderWidgetTemplates = renderWidgetTemplates;
widgets.getWidgets = getWidgets;

module.exports = widgets;
