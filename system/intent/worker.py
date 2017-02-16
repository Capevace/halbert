import json
import sys
import time

# # If there's a second argument given, use that to insert an import path
# # This enables users to use their own Adapt installation directories.
# if len(sys.argv) > 1:
#     sys.path.insert(0, sys.argv[1])
#
# from adapt.intent import IntentBuilder
# from adapt.engine import IntentDeterminationEngine
#
# running = True
# engine = IntentDeterminationEngine()

def main():
    lines = sys.stdin.readlines()
    print 'hellp %s' %(json.dumps(lines[0]))
    # while True:
        # print json.dumps(line)
        # action = json.loads(line)
        # parse_action(action)


def parse_action(action):
    if action['type'] == 'update_intents':
        update_intents(action['payload'])
    elif action['type'] == 'update_entities':
        update_entities(action['payload'])
    elif action['type'] == 'parse_intent':
        parse_intent(action['payload'])
    elif action['type'] == 'shutdown':
        running = False
    else:
        # Welp, this wasn't supposed to happen...
        respond({ 'type': 'error', 'error': 'Unknown Action %s' %(action['type']) })






if __name__ == '__main__':
    main()
