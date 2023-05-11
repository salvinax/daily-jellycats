from selenium import webdriver
import time
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import requests
from bs4 import BeautifulSoup
import json

baseurl = 'https://www.jellycat.com'
url = 'https://www.jellycat.com/us/all-soft-toys/'

s = Service('C:/webdriver/chromedriver')

headers = {
    'User-Agent': 'Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36'
}

driver = webdriver.Chrome(service=s)
driver.get(url)
time.sleep(3)

element = driver.find_element(By.TAG_NAME, 'body')

for i in range(200):
    element.send_keys(Keys.PAGE_DOWN)
    time.sleep(0.1)
    
page_source = driver.page_source
soup = BeautifulSoup(page_source, 'html.parser')

products = soup.find_all('span', class_ = 'relative block listing-image')
product_links = []
img_links = []

for item in products:
    srclink = item.find('a', href=True).findChild()
    img_links.append(srclink['src'])

    hlink = item.find('a', href=True)
    product_links.append(baseurl + hlink['href'])

product_name = []
product_desc = []
    
for link in product_links: 
    r = requests.get(link, headers=headers)
    soup = BeautifulSoup(r.content, 'html.parser')
    name = soup.find('h1', class_='mtb0-5 f-capi').text
    description = soup.find('div', id='metadata').findNext().text

    product_name.append(name)
    product_desc.append(description)

# all product information 
zipped = list(zip(product_name, product_desc, img_links, product_links))

collection = []

for item in zipped: 

    jellycat = {
        "name": item[0],
        "description": item[1] , 
        "img_link": item[2],
        "product_links" : item[3]
    }

    collection.append(jellycat)


# Serializing json
json_object = json.dumps(collection, indent=4)
 
# Writing to sample.json
with open("database.json", "w") as outfile:
    outfile.write(json_object)




