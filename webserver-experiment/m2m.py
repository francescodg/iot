import requests
import json

def _subscribe(uri, notificationUri, resourceName):
	headers = {
		'X-M2M-Origin': 'admin:admin',
		'Accept': 'application/json',
		'Content-Type': 'application/json;ty=23'
	}
	body = {'m2m:sub': {'rn': resourceName, 'nu': notificationUri, 'nct': '2'}}
	r = requests.post(uri, headers=headers, json=body)
	return r
	
def delete(uri):
	headers = {
		'X-M2M-Origin': 'admin:admin'
	}
	return requests.delete(uri, headers=headers)
	
def subscribe(resource, notificationUri):
	uri = "http://127.0.0.1:8282/~/mn-cse/mn-name" + resource
	notificationUri = "http://localhost:5000" + notificationUri	
	r = _subscribe(uri, notificationUri, "PythonMonitor")	
	if r.status_code == 409:
		delete(uri + "/PythonMonitor")
		r = _subscribe(uri, notificationUri, "PythonMonitor")
	return r.status_code
	
def getResourceNameById(identifier):
	headers = { 'X-M2M-Origin': 'admin:admin', 'Accept': 'application/json' }
	r = requests.get("http://127.0.0.1:8282/~" + identifier, headers=headers)
	return r.json()["m2m:cnt"]["rn"]
	
	
def parseNotify(notify):
	if notify['m2m:sgn'].has_key('nev'):
		value = notify['m2m:sgn']['nev']['rep']['con']
		key = notify['m2m:sgn']['nev']['rep']['pi']
		resourceId = getResourceNameById(key)		
		return (resourceId, value)
	else:
		raise ValueError	

		
	

