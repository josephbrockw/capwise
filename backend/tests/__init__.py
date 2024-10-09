import json


def read_api_response(response, show=False):
    print(response)
    print(response.content)
    code = response.status_code
    response = json.loads(response.content)
    data = response.get('data', {})
    msg = response.get('message', '')
    err = response.get('error', '')
    if show:
        print(f"Data:\n{data}")
        print(f"Message: {msg}")
        print(f"Error:   {err}")
        print(f"Code:    {code}")
    return data, msg, err, code
