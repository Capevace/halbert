module.exports = function (deviceCode, state) {
  let house = '';
  let group = '';
  switch (deviceCode.charAt(0)) {
    case 'A':
      house = '11111111';
      break;
    case 'B':
      house = '10111111';
      break;
    case 'C':
      house = '11101111';
      break;
    case 'D':
      house = '10101111';
      break;
    default:
      console.logger.error(`'${deviceCode}' is not a valid device code.`);
      return null;
  }

  switch (deviceCode.charAt(1)) {
    case '1':
      group = '11111111';
      break;
    case '2':
      group = '10111111';
      break;
    case '3':
      group = '11101111';
      break;
    default:
      console.logger.error(`'${deviceCode}' is not a valid device code.`);
      return null;
  }

  const newState = !!state ? '01' : '11';

  return house + group + '1110101' + newState;
}
