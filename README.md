<p align="center"><img alt="halbert logo" src="/halbert.jpg?raw=true"></p>
<h1 align="center">H.A.L.B.E.R.T.</h1>
<h4 align="center">
  Open-Source Home Automation running Node.js on a Raspberry Pi
</h4>
<p align="center">
  <img alt="license" src="https://img.shields.io/npm/l/halbert-ai.svg?style=flat-square">
  <img alt="release" src="https://img.shields.io/github/release/capevace/halbert.svg?style=flat-square">
  <img alt="node version" src="https://img.shields.io/node/v/halbert-ai.svg?style=flat-square">
  <img alt="npm downloads" src="https://img.shields.io/npm/dt/halbert-ai.svg?style=flat-square">
</p>

- [What is H.A.L.B.E.R.T.](#what-is-halbert)
- [Getting Started](#getting-started)
- [File Structure](#structure)
- [Modules](#modules)
- [Config](#config)
- [About the Code](#about-the-code)


## What is H.A.L.B.E.R.T.
H.A.L.B.E.R.T. is a little Node.js project, that is supposed to run on the _Raspberry Pi_. It is designed to be easily expendable using modules that are simple and easy to write. The name is a combination of the **HAL-9000** computer from 2001: A Space Odyssey and the stereotypical butler's name **Albert**.

Halbert has the following features:
- Web-Interface with a customizable Dashboard
- Voice-Control using API.ai for language processing
- Apple Home-Kit integration (for use with Siri etc.)
- Easily extendable using modules and a powerful API
- Based on a simple to understand *Trigger-Action-Principle*

## Getting Started
To get started, download the Halbert-CLI from npm
```shell
npm install -g halbert-cli
```
or using yarn.
```shell
yarn global add halbert-cli
```

Then, create a new H.A.L.B.E.R.T. Instance using.
This will create a new folder with the given name, and
then create default files and folders.
```shell
halbert new <directory-name>
```

You can then change the directory into the newly created one.
After that, you can start the system using `halbert start`. (*If the `npm install` process failed, you may have to do that manually before starting.*)
```shell
cd <directory-name>
halbert start
```

## Structure
When you create a new H.A.L.B.E.R.T. Instance, you get a folder structure resembling this:
```
your-directory
  halbert.config.json
  modules/
  node_modules/
  package.json
  persist
```

**halbert.config.json** - This is the config file. It's features are documented [here](#halbert.config.json). This file stores the main config for the system itself but also all of its modules.

**modules/** - This is the folder where you can put in your own modules. You can either create them yourself or download them from other sources.

**node_modules/** - Your NPM Modules folder.

**package.json** - Your package.json file. Used to install the halbert-core.

**persist/** - Used to store data that is persistant over launches of the system.

## Config
This is what an example config looks like:
```
  {
    "device": {
      "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    },
    "weather": {
      "openWeatherMapApiKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    },
    "server": {
      "port": 3000,
      "cacheTemplates": false
    },
    "modules": {
      "switches": {
        "gpio": {
          "remote": 15
        },
        "available": [
          {
            "id": "desk-leds",
            "name": "Desk LED",
            "hotwords": ["desk led", "desk leds", "leds on the desk"],
            "type": "remote",
            "protocol": "intertechno",
            "code": "A1"
          },
          {
            "id": "desk-light",
            "name": "Desk Light",
            "hotwords": ["desk light", "desk lamp", "lamp on the desk", "light on the desk"],
            "type": "remote",
            "protocol": "intertechno",
            "code": "A2"
          }
        ]
      },
      "ifttt": {
        "apiKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "webhookSecret": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      }
    }
  }

```

### Config Documentation
**Coming soon**

## Modules
Modules are the primary source of logic for Halbert. There are multiple built-in modules, providing basic funcitonality. But the main purpose of this system, is so users can create and share their own modules.

### How to make a module
Create a new folder with the desired module name (it should be lowercase and no spaces).
Inside that folder, create an index.js file. This will be your entry point.
A boilerplate index.js file would look like this:
```javascript
module.exports = function (builder) {
  // Your Code in here
};
```

The builder object is a utility which gives you access to the underlying systems such as widgets, api routes, actions or triggers.

### Builder
The Builder consists of multiple different sub-objects.
- [builder.accessories](#builderaccessories)
- [builder.actions](#builderactions)
- [builder.routes](#builderroutes)
- [builder.triggers](#buildertriggers)
- [builder.widgets](#builderwidgets)

#### builder.accessories
This builder enables you to create accessories to be used by Apple's Home Kit. Since Halbert deploys a HomeKit-Bridge, you can make the things you're building controllable via the iOS Home App.

##### .`createAccessory(name, id)` -> `Accessory`

Create an accessory and return it. If you want to know, how to further work with these Accessory Objects, see [HAP-NodeJS](https://github.com/KhaosT/HAP-NodeJS).

##### .`getAccessories()` -> `Array`

Get a list of this module's registered accessories.

#### builder.actions
This builder enables you to create actions to be used by other modules, widgets etc.
You can chain these calls.

##### .`createAction(actionId)` -> `ActionBuilder`

Create an actions with the supplied id.

##### .`setMeta(name, sentence)` -> `ActionBuilder`

Set the action's meta data. This means the Action title and the sentence. The sentence part should fit into the sentence '_If trigger, then [X]_'.

##### .`setCallback()` -> `ActionBuilder`

Set the callback for an action call. The callback will be supplied with an `input`-argument.
E.g.
```javascript
.setCallback(function (input) {
  console.log(input.temperature);
});

```
##### .`getActions()` -> `Array`

Get a list of this module's actions.


## About the Code
The Code is formatted using JLongster's [prettier](https://github.com/jlongster/prettier).
