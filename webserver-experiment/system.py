import random
import json
import m2m

class System:
    def __init__(self):
        self.sensors = {
            'Temperature_Sensor_0': [],
            'Temperature_Sensor_1': [],
            'Temperature_Sensor_2': [],
            'Temperature_Average': []
        }
        self.temperatureSensors = self._retrieveSensors("temperature")
        self.luminositySensors = self._retrieveSensors("luminosity")
        self.humiditySensors = self._retrieveSensors("humidity")

    def retrieveSensorsHistory(self):
        for sensor in self.temperatureSensors:
            sensor['history'] = m2m.getSensorHistory(sensor['uri'])
        for sensor in self.luminositySensors:
            sensor['history'] = m2m.getSensorHistory(sensor['uri'])
        for sensor in self.humiditySensors:
            sensor['history'] = m2m.getSensorHistory(sensor['uri'])

    def _retrieveSensors(self, sensorType):
        sensors = []
        if sensorType == "temperature":
            sensorUris = m2m.getTemperatureSensors()
        elif sensorType == "humidity":
            sensorUris = m2m.getHumiditySensors()
        elif sensorType == "luminosity":
            sensorUris = m2m.getLuminositySensors()
        else:
            sensorUris = []
        for s in sensorUris:
            sensors.append({
                'id': s,
                'uri': sensorUris[s],
                'history': [],
                'lastValue': m2m.getSensorLastValue(sensorUris[s])
            })
        return sensors

    def getLastValue(self, sensorType):
        collection = []
        for sensor in self.temperatureSensors:
            sensor['lastValue'] = m2m.getSensorLastValue(sensor['uri'])
            collection.append({
                'id': sensor['id'],
                'lastValue': sensor['lastValue']})
        return collection
            
        
    def update(self, sensorId, value, time):
        for sensor in self.temperatureSensors:
            if sensor['id'] == sensorId:
                sensor['history'].append({
                    'time': time,
                    'value': value})       
                break    
        
    def random(self):
        for sensor in self.sensors:
            self.sensors[sensor].append(random.random() * 100)

    def randomUpdate(self, index):
        return

    @property
    def averageTemperature(self):
        return 0

    @property
    def overview(self):        
        overview = {
            'averageTemperature': random.randint(0, 100),
            'averageHumidity': random.randint(0, 110),
            'averageLuminosity': random.randint(0, 100),
            'boiler': {
                'pressure': random.randint(0, 100),
                'fuel': random.randint(0, 100)
            }
        }
        return json.dumps(overview)