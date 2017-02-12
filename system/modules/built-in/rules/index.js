const uuid = require('uuid-1345').v4;

const ruleCallbacks = {};

function setupRule(ruleData, builder) {
  const triggerCallback = output => {
    console.logger.info(`Rule '${ruleData.id}' ran.`);
    builder.runAction(ruleData.action.id, ruleData.action.arguments);
  };
  ruleCallbacks[ruleData.id] = triggerCallback;
  console.logger.warn(
    ruleData,
    ruleData.trigger,
    triggerCallback,
    ruleData.trigger.condition === triggerCallback
  );
  builder.triggers.listen(
    ruleData.trigger.id,
    ruleData.trigger.condition,
    triggerCallback
  );
}

module.exports = builder => {
  // Setup saved rules
  builder.database
    .get('rules')
    .value()
    .forEach(rule => setupRule(rule, builder));

  builder.widgets
    .createWidget('Rules Settings', 'rule-settings', 'rules.html')
    .addSetting('rule', 'string')
    .onDataRequest(settings => {
      return {
        rules: builder.database.get('rules').value()
      };
    });

  builder.routes.post('/rules/create', (req, res) => {
    if (!req.body.trigger || req.body.trigger && !req.body.trigger.id) {
      res.status(400).json({
        status: 400,
        message: 'Your trigger was not configured properly.'
      });
      return;
    }

    if (!req.body.action || req.body.action && !req.body.action.id) {
      res.status(400).json({
        status: 400,
        message: 'Your action was not configured properly.'
      });
      return;
    }

    const rule = {
      id: uuid(),
      trigger: {
        id: req.body.trigger.id,
        condition: req.body.trigger.condition || {}
      },
      action: {
        id: req.body.action.id,
        arguments: req.body.action.arguments || {}
      }
    };

    setupRule(rule, builder);
    builder.database.get('rules').push(rule).value();

    res.sendStatus(200);
  });
};
