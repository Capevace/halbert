const fs = require('fs');
const path = require('path');
const isFunction = require('lodash/isFunction');
const { server } = require('../../config');

function renderTemplate(templateFileName, moduleId) {
  return fs.readFileSync(
    path.resolve(__dirname, '../built-in', moduleId, templateFileName),
    'utf8'
  );
}

class WidgetBuilder {
  constructor(moduleId) {
    this.moduleId = moduleId;
    this.currentWidgetId = null;
    this.widgets = {};
  }

  createWidget(name, componentName, widgetContent) {
    let content;

    if (!isFunction(widgetContent)) {
      if (server.cacheTemplates) {
        content = renderTemplate(widgetContent, this.moduleId);
      } else {
        content = () => renderTemplate(widgetContent, this.moduleId);
      }
    } else {
      content = widgetContent;
    }

    const widget = {
      name,
      componentName,
      moduleId: this.moduleId,
      id: `${this.moduleId}-${componentName.toLowerCase()}`,
      content,
      onDataRequest: () => ({}),
      settingsTypes: {}
    };

    this.widgets[widget.id] = widget;
    this.currentWidgetId = widget.id;

    console.logger.success(`Created widget '${widget.id}'.`);

    return this;
  }

  onDataRequest(callback) {
    if (!this.currentWidgetId) return this;
    if (!callback) {
      callback = () => {
        console.logger.warn(
          `No onDataRequest callback provided for widget ${this.currentWidgetId}.`
        );
      };

      // Execute to log
      callback();
    }

    this.widgets[this.currentWidgetId].onDataRequest = callback;

    return this;
  }

  addSetting(key, type) {
    if (!this.currentWidgetId) return this;

    if (!key || !type) {
      console.logger.warn(
        `No key or type provided for option in widget ${this.currentWidgetId}`
      );
      return;
    }

    if (typeof type === 'string') {
      this.widgets[this.currentWidgetId].settingsTypes[key] = {
        type
      };
    } else {
      // If type is not a string we treat it like an options object
      this.widgets[this.currentWidgetId].settingsTypes[key] = type;
    }

    return this;
  }

  getWidgets() {
    // Placeholder for later replacement with prototype
    return {};
  }
}

module.exports = WidgetBuilder;
