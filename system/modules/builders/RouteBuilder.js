// The RoutesBuilder enables modules to build routes,
// without direct access to the app instance.
// Also does chaining
class RouteBuilder {
  constructor(moduleId) {
    this.moduleId = moduleId;
    this.routes = [];
  }

  get(route, ...args) {
    this.routes.push({
      moduleId: this.moduleId,
      route,
      method: "GET",
      args
    });

    return this;
  }

  post(route, ...args) {
    this.routes.push({
      route,
      method: "POST",
      args
    });

    return this;
  }

  patch(route, ...args) {
    this.routes.push({
      route,
      method: "PATCH",
      args
    });

    return this;
  }

  put(route, ...args) {
    this.routes.push({
      route,
      method: "PUT",
      args
    });

    return this;
  }
}

module.exports = RouteBuilder;
