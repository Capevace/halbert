const database = require('../../database');
const { renderWidgetTemplates, getWidgets } = require('../widgets');

function getDataForWidget(req, res) {
  const widgetEntry = database.get('widgets').find({ id: req.params.id });
  const widget = moduleRegistry.getWidget(widgetEntry.component);
  res.json(widget.onDataRequest(widgetEntry.settings));
}

module.exports = {
  getDataForWidget
};
