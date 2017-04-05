import random
import json
import m2m

class System:
    def __init__(self):
        self.temperatureSensors = self._retrieveSensors("temperature")
        self.luminositySensors = self._retrieveSensors("luminosity")
        self.humiditySensors = self._retrieveSensors("humidity")
        self.sensors = {
            "temperature": self.temperatureSensors,
            "humidity": self.humiditySensors,
            "luminosity": self.luminositySensors
        }


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


    # TODO Deprecated    
    def __getLastValue(self, sensorType):
        collection = []
        for sensor in self.sensors[sensorType]:
            sensor['lastValue'] = m2m.getSensorLastValue(sensor['uri'])
            collection.append({
                'id': sensor['id'],
                'lastValue': sensor['lastValue']})
        return collection


    def getLastValue(self, sensor):
        return m2m.getSensorLastValue(sensor['uri'])

        
    def update(self, sensorType, sensorId, value, time):
        for sensor in self.sensors[sensorType]:
            if sensor['id'] == sensorId:
                sensor['history'].append({
                    'time': time,
                    'value': value})
                break    

    def clearHistory(self, sensorType, sensorName):
        sensor = self._findSensor(sensorType, sensorName)
        sensor['history'] = []
        m2m.clearHistory(sensor['uri'])

    def getSensorsAverage(self, sensorType):
        uri = {
            'temperature': "/mn-cse/mn-name/GreenHouse/Temperature_Average",
            'humidity': "/mn-cse/mn-name/GreenHouse/Humidity_Average",
            'luminosity': "/mn-cse/mn-name/GreenHouse/Luminosity_Average"
        }
        if uri.has_key(sensorType):
            return m2m.getSensorLastValue(uri[sensorType])
        else:
            return None

    def _findSensor(self, sensorType, sensorName):
        for sensor in self.sensors[sensorType]:
            if sensor['id'] == sensorName:
                return sensor

    def random(self):
        pass


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
