import urllib.request
from PIL import Image
import io

url = 'https://pub-96ce671efbac4dbfbc89b044c631a913.r2.dev/ChatGPT%20Image%20Jun%2023%2C%202026%2C%2004_40_29%20PM.png'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    img = Image.open(io.BytesIO(response.read()))
    print(f'Size: {img.size}')
