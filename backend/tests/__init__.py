def read_api_response(response, show=False):
    data = response.data.get('data', {})
    msg = response.data.get('message', '')
    err = response.data.get('error', '')
    code = response.status_code
    if show:
        print(f"Data:\n{data}")
        print(f"Message: {msg}")
        print(f"Error:   {err}")
        print(f"Code:    {code}")
    return data, msg, err, code
