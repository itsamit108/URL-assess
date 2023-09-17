import re
import ssl
import urllib.request

import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow requests from your React frontend
origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Define a function to check for common vulnerabilities and security aspects
def assess_vulnerabilities(url):
    try:
        # Send a GET request to the provided URL
        response = requests.get(url)
        response.raise_for_status()

        # Parse the HTML content
        soup = BeautifulSoup(response.text, "html.parser")

        # Initialize a list to store detected vulnerabilities
        vulnerabilities = []

        # Check for common vulnerabilities using regular expressions
        common_vulnerabilities = {
            "XSS": [r"<script\b", r"alert\(", r"onerror="],
            "SQL Injection": [r"\bSELECT\b", r"\bDROP\b", r"\bUNION\b"],
            "Command Injection": [
                r";\s*ls",
                r"&&\s*rm\s*-rf",
                r"\|\s*cat\s+/etc/passwd",
            ],
            "Insecure Password Storage": [r'type=["\']?password["\']?'],
            "Cross-Site Request Forgery (CSRF)": [r"csrf[-_]token", r"csrf_token"],
            "Insecure Direct Object References (IDOR)": [
                r"\buser_id\b=1",
                r"\bfile\b=../../etc/passwd",
            ],
            "Sensitive Data Exposure": [r"\bpassword\b", r"\bapikey\b", r"\bsecret\b"],
            "Security Misconfiguration": [r"404\s*Not Found", r"403\s*Forbidden"],
            "Broken Authentication": [r"\blogin\b", r"authentication\s*failed"],
            "Insecure Deserialization": [r"phpserialize", r"pickle\.load\("],
        }

        for vulnerability, patterns in common_vulnerabilities.items():
            for pattern in patterns:
                if re.search(pattern, soup.text, re.IGNORECASE):
                    vulnerabilities.append(vulnerability)

        # Check if the website uses HTTPS
        if not url.startswith("https://"):
            vulnerabilities.append("Not Using HTTPS")

        # Check for SSL certificate
        try:
            context = ssl.create_default_context()
            with urllib.request.urlopen(url, context=context) as response:
                pass
        except (ssl.SSLError, urllib.error.URLError):
            vulnerabilities.append("SSL Certificate Issue")

        if vulnerabilities:
            return {"vulnerabilities": vulnerabilities}
        else:
            return {"vulnerabilities": ["No Common Vulnerabilities Detected"]}

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.get("/vulnerability/")
async def assess_url_vulnerability(url: str):
    result = assess_vulnerabilities(url)
    return {"url": url, "assessment": result}
