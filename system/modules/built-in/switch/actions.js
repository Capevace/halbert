const transmitCode = require('433mhz');
const intertechno = require('./codes/intertechno');
const { JaroWinklerDistance } = require('natural');

const switches = {};

function actions(moduleState) {
  if (
    HALBERT_CONFIG.modules.switches && HALBERT_CONFIG.modules.switches.available
  ) {
    HALBERT_CONFIG.modules.switches.available.forEach(switchConfig => {
      // Setup switch
      switches[`${switchConfig.id}`] = switchConfig;

      moduleState.set(`switch_${switchConfig.id}`, {
        state: false
      });

      console.logger.info(`Prepared switch ${switchConfig.id}.`);
    });
  }

  moduleState.set('busy', false);

  function toggle(data, state) {
    let switchId = data.switchId;

    if (Array.isArray(data.switchName)) {
      data.switchName.forEach(name => toggle({ switchName: name }, state));

      return;
    } else if ('switchName' in data) {
      // Find Id
      switchId = switchNameToId(data.switchName);
      if (switchId === null) {
        console.logger.error(
          `Switch with name '${data.switchName}' could not be found.`
        );
        return;
      }
    }

    toggleWithId(switchId, state);
  }

  function toggleWithId(switchId, state) {
    const switchConfig = switches[`${switchId}`];

    if (!switchConfig) {
      console.logger.error(`Switch with '${switchId}' is not configured.`);
      return;
    }

    switch (switchConfig.type) {
      case 'remote':
        toggleRemote(switchConfig, state);
        break;
      case 'relay':
        toggleRelay(switchConfig, state);
        break;
      default:
        console.logger.error(`Switch with '${switchId}' does not have a type.`);
        break;
    }
  }

  function toggleRemote(switchConfig, state) {
    const code = deviceCodeToBinary(switchConfig, state);

    // Set state of switch, but also set it to busy
    moduleState.set('busy', true);
    moduleState.set(`switch_${switchConfig.id}`, {
      state
    });

    if (DEBUG_MODE) {
      setTimeout(
        () => {
          moduleState.set('busy', false);
        },
        500
      );
    } else {
      transmitCode(code, err => {
        if (err) throw err;
        // finally remove busy state
        moduleState.set('busy', false);
      });
    }
  }

  function toggleRelay(switchConfig, state) {
    // TODO: add proper toggling of lights
    moduleState.set(`switch_${switchConfig.id}`, {
      state
    });
  }

  function switchNameToId(switchName) {
    const result = HALBERT_CONFIG.modules.switches.available.reduce(
      (best, switchConfig) => {
        if (!switchConfig.hotwords) {
          const distance = JaroWinklerDistance(switchName, switchConfig.id);

          if (!best || distance > best.distance) {
            return {
              distance,
              hotword: switchConfig.id,
              config: switchConfig
            };
          }

          return best;
        }

        const result = switchConfig.hotwords.reduce(
          (bestHotword, hotword) => {
            const distance = JaroWinklerDistance(switchName, hotword);
            if (!bestHotword || distance > bestHotword.distance) {
              return {
                distance,
                hotword
              };
            }
            return bestHotword;
          },
          null
        );

        if (!best || result !== null && result.distance > best.distance) {
          return {
            distance: result.distance,
            hotword: result.hotword,
            config: switchConfig
          };
        }

        return best;
      },
      null
    );

    if (result) {
      return result.config.id;
    }

    return null;
  }

  // 1111111111111111111010101 // A1
  //
  // 1111111110111111111010101 // A2
  // 1111111111101111111010101 // A3
  //
  // 1011111111111111111010101 // B1
  // 1011111110111111111010101 // B2
  // 1011111111101111111010101 // B3
  //
  // 1110111111111111111010101 // C1
  // 1110111110111111111010101 // C2
  // 1110111111101111111010101 // C3
  //
  // 1010111111111111111010101 // D1
  // 1010111110111111111010101 // D2
  // 1010111111101111111010101 // D3

  function deviceCodeToBinary(switchConfig, state) {
    switch (switchConfig.protocol) {
      case 'intertechno':
        const i = intertechno(switchConfig.code, state);
        return i;
      default:
        console.logger.error(
          `There is no device code generator for the type '${switchConfig.protocol}' in switch '${switchConfig.id}'.`
        );
        return null;
    }
  }

  return {
    on: data => toggle(data, true),
    off: data => toggle(data, false)
  };
}

module.exports = actions;
