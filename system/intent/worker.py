import json
import sys
from socketIO_client import SocketIO, BaseNamespace

# If there's a second argument given, use that to insert an import path
# This enables users to use their own Adapt installation directories.
if len(sys.argv) > 1:
    sys.path.insert(0, sys.argv[1])

from adapt.intent import IntentBuilder
from adapt.engine import IntentDeterminationEngine

# The intent key is used to authenticate to the intent io.
# Since this key is never transmitted over the internet though, we can just use
# a static one that was set in the config.
# It is passed as a second argument to the python script.
INTENT_KEY = str(sys.argv[2])

engine = IntentDeterminationEngine()

def update_intents(payload):
    for intent in payload['intents']:
        ib = IntentBuilder(intent['name'].encode('utf-8'))

        for requirement in intent['requirements']:
            ib.require(requirement['entity'], requirement['attribute'])

        for optional in intent['optionals']:
            ib.optionally(optional['entity'], optional['attribute'])

        engine.register_intent_parser(ib.build())


def update_entities(payload):
    for entity in payload['entities']:
        if entity['type'] == 'string':
            for value in entity['values']:
                engine.register_entity(value, entity['name'])
        elif entity['type'] == 'regex':
            engine.register_regex_entity(entity['pattern'])

def parse_intent(payload):
    intents = list(engine.determine_intent(payload['query']))
    return {'intents': intents, 'id': payload['id']}

class IntentNamespace(BaseNamespace):
    def on_connect(self):
        print('Connected to H.A.L.B.E.R.T.')
        self.emit('parser-log', 'Intent Parser Connected to H.A.L.B.E.R.T.')

    def on_reconnect(self):
        print('Reconnected to H.A.L.B.E.R.T.')

    def on_disconnect(self):
        print('Disconnected from H.A.L.B.E.R.T.')

    def on_error(err1, err2, err3, err4):
        print 'This error happened: %s %s %s %s' %(str(err1), str(err2), str(err3), str(err4))

    def on_update_intents_request(self, payload):
        print 'Updating Intents'
        update_intents(payload)

    def on_update_entities_request(self, payload):
        print 'Updating Entities'
        update_entities(payload)

    def on_parse_intent_request(self, payload):
        print 'Parsing Intent'
        self.emit('parsed_intent', parse_intent(payload))

socketIO = SocketIO('localhost', 3000, headers={'authkey': INTENT_KEY})
socketIO.define(IntentNamespace, '/intent')
socketIO.wait()
