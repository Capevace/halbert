const os = require('os');

function getLocalIP() {
  const ifaces = os.networkInterfaces();
  let addresses = {};

  Object.keys(ifaces).forEach((ifname) => {
    var alias = 0;

    ifaces[ifname].forEach((iface) => {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      if (alias >= 1) {
        if (!addresses[ifname]) {
          addresses[ifname] = [iface.address];
        } else {
          addresses[ifname].push(iface.address);
        }
      } else {
        addresses[ifname] = [iface.address];
      }
      ++alias;
    });
  });

  if (addresses['en0']) {
    return addresses['en0'][0];
  } else if (addresses['en1']) {
    return addresses['en1'][0];
  }
}

module.exports = {
  getLocalIP
};
