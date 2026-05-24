import sys
from selenium import webdriver
from selenium.webdriver.edge.service import Service
from selenium.webdriver.edge.options import Options

def main():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    
    # Try to start edge
    try:
        driver = webdriver.Edge(options=options)
    except Exception as e:
        print("Failed to start Edge webdriver:", e)
        return

    driver.get('file:///d:/Antigravity%20projects/Periodic%20table/src/index.html')
    
    # Wait a bit
    import time
    time.sleep(1)
    
    # Get logs
    logs = driver.get_log('browser')
    for entry in logs:
        print(f"[{entry['level']}] {entry['message']}")
        
    driver.quit()

if __name__ == '__main__':
    main()
