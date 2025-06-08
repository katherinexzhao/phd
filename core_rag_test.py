import requests

def test_core_api():
    core_api_key = "PQTrZSq3evmLNcJbVhaR2fBipI4wos5n"
    url = "https://core.ac.uk/api-v2/articles/search?q=machine learning&page=1&pageSize=5"
    headers = {
        "Authorization": f"Bearer {core_api_key}"
    }
    response = requests.get(url, headers=headers)
    print("Status Code:", response.status_code)
    print("Response Text:", response.text[:500])  # 只显示前 500 字符，避免太长

test_core_api()
