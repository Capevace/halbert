jest.mock('../../widgets');
const uiController = require('../uiController');

describe('uiController', () => {
  const request = {
    user: {
      username: 'Lukas'
    }
  };
  const response = {
    render(name) {
      return '<PAGE>';
    }
  };

  test('returns dashboard view', () => {
    const render = (name, data) => {
      expect(name).toBe('dashboard');
      expect(data.layout).toBe(false);
      expect(data.widgetTemplates).toMatch(/<WIDGET TEMPLATES>/);
      expect(data.widgetList).toMatch(/^\[.*\]$/);
      expect(data.token).toBeDefined();
    };

    const renderedPage = uiController.renderDashboard(
      request,
      Object.assign({}, response, {
        render
      })
    );
  });
  // Other methods don't really need to be tested, since they simply render
  // views.
});
