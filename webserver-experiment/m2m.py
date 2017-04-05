import requests
import json

M2M_HOST = "http://127.0.0.1:8282/~"
	
def delete(uri):
	headers = {
		'X-M2M-Origin': 'admin:admin'
	}
	return requests.delete(uri, headers=headers)

def clearHistory(uri):
        r = _getContentInstances(uri)
        contentInstances = r.json()["m2m:uril"].split()
        for contentInstance in contentInstances:
                delete(M2M_HOST + contentInstance)
	
def subscribe(resource, notificationUri):
	notificationUri = "http://localhost:5000" + notificationUri
        uri = M2M_HOST + resource
        r = _subscribe(uri, notificationUri, "PythonMonitor")
        
	if r.status_code == 409:
		delete(uri + "/PythonMonitor")
		r = _subscribe(uri, notificationUri, "PythonMonitor")
        return r.status_code

	uri = "http://127.0.0.1:8282/~/mn-cse/mn-name" + resource
	notificationUri = "http://localhost:5000" + notificationUri	
	r = _subscribe(uri, notificationUri, "PythonMonitor")	
	if r.status_code == 409:
		delete(uri + "/PythonMonitor")
		r = _subscribe(uri, notificationUri, "PythonMonitor")
	return r.status_code

	
def getResourceNameById(identifier):
	headers = _createHeader()
	r = requests.get(M2M_HOST + identifier, headers=headers)
	return r.json()["m2m:cnt"]["rn"]	

	
def parseNotify(notify):
	if notify['m2m:sgn'].has_key('nev'):
                if notify['m2m:sgn']['nev']['rss'] == 2:
                        raise ValueError # Ignore Delete notify
		value = notify['m2m:sgn']['nev']['rep']['con']
                time = notify['m2m:sgn']['nev']['rep']['lt']
		resourceId = notify['m2m:sgn']['nev']['rep']['pi']
		resourceName = getResourceNameById(resourceId)\
                        .replace('Brightness', 'Luminosity')
		return (resourceName, value, time)
	else:
		raise ValueError

		
def getTemperatureSensors():
        sensors = {}
        r = _getContainers("/mn-cse/mn-name/Temperature")
        if r.status_code == 200:
                for sensorUri in r.json()['m2m:uril'].split():
                        key = sensorUri.split('/')[-1]
                        value = sensorUri
                        sensors.update({key: value})        
        return sensors


def getHumiditySensors():
        sensors = {}
	r = _getContainers("/mn-cse/mn-name/Humidity")
        if r.status_code == 200:
                for sensorUri in r.json()['m2m:uril'].split():
                        key = sensorUri.split('/')[-1]
                        value = sensorUri
                        sensors.update({key: value})        
        return sensors


def getLuminositySensors():
        sensors = {}
	r = _getContainers("/mn-cse/mn-name/Luminosity")
        if r.status_code == 200:
                for sensorUri in r.json()['m2m:uril'].split():
                        key = sensorUri.split('/')[-1].\
                              replace("Brightness", "Luminosity")
                        value = sensorUri
                        sensors.update({key: value})        
        return sensors

def getSensorHistory(sensorUri):
        history = []
        r = _getContentInstances(sensorUri)

        if (r.status_code == 200):              
                uris = r.json()["m2m:uril"]
                if len(uris) == 0:
                        return history
                for contentInstanceUri in uris.split():
                        r = requests.get(
                                M2M_HOST + contentInstanceUri,
                                headers=_createHeader())
                        value = r.json()["m2m:cin"]["con"]
                        timestamp = r.json()["m2m:cin"]["ct"]
                        history.append({
                                'time': timestamp,
                                 'value': float(value)})
        return history


def getSensorLastValue(sensorUri):
        r = _getLastValue(sensorUri)                
        if r.status_code == 200:
                return float(r.json()["m2m:cin"]["con"])
        else:
                return None


def _getLastValue(container):
        r = requests.get(
                M2M_HOST + container + '/la',
                headers=_createHeader())
        return r


def _getContentInstances(container):
        r = requests.get(
                M2M_HOST + container,
                headers=_createHeader(),
                params={'fu': 1, 'ty': 4, 'drt': 0})
        return r

def _getContainers(ae):
        r = requests.get(
                M2M_HOST + ae,
                headers=_createHeader(),
                params={'fu': 1, 'ty': 3})
        return r


def _createHeader(accept="application/json", contentType="application/json"):
        headers = {}
        headers['X-M2M-Origin'] = 'admin:admin'
        if len(accept):
                headers['Accept'] = accept
        if len(contentType):
                headers['Content-Type'] = contentType
        return headers


def _subscribe(uri, notificationUri, resourceName):
	headers = {
		'X-M2M-Origin': 'admin:admin',
		'Accept': 'application/json',
		'Content-Type': 'application/json;ty=23'
	}
	body = {'m2m:sub': {'rn': resourceName, 'nu': notificationUri, 'nct': '2'}}
	r = requests.post(uri, headers=headers, json=body)
	return r
