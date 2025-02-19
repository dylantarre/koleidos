import json
import sys
sys.path.append("persona_function")
from handler import handler
from flask import Request

class DummyRequest:
    def __init__(self, body):
        self.body = body
    def get_json(self, silent=False):
        return json.loads(self.body)

if __name__ == "__main__":
    test_body = '{"persona": "test persona", "template": "instruction"}'
    req = DummyRequest(test_body)
    resp = handler(req)
    print("Status code:", resp.status_code)
    print("Response body:", resp.get_data(as_text=True)) 