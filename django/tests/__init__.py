import json


def read_api_response(response, show=False):
    code = response.status_code
    response = json.loads(response.content)
    data = response.get("data", {})
    msg = response.get("message", "")
    err = response.get("error", "")
    err_code = response.get("error_code", None)
    if show:
        print(f"Data:\n{json.dumps(data, indent=2)}")
        print(f"Message:  {msg}")
        print(f"Error:    {err}")
        print(f"Err Code: {err_code}")
        print(f"Code:     {code}")

    return data, msg, err, code
