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
        self.actuators = {
            "sprinklers": [
                {"id": "Sprinkler_0", "uri": "/in-cse/in-name/Controller/Sprinkler_0"},
                {"id": "Sprinkler_1", "uri": "/in-cse/in-name/Controller/Sprinkler_1"},
                {"id": "Sprinkler_2", "uri": "/in-cse/in-name/Controller/Sprinkler_2"},
                {"id": "Sprinkler_3", "uri": "/in-cse/in-name/Controller/Sprinkler_3"}],
            "shaders": [
                {"id": "Shader_0", "uri": "/in-cse/in-name/Controller/Shader_0"},
                {"id": "Shader_1", "uri": "/in-cse/in-name/Controller/Shader_1"}]
        }
        self.shaders = m2m.getActuators("actuator/luminosity")
        self.boiler = m2m.getActuators("actuator/temperature")[0]
        self.sprinklers = m2m.getActuators("actuator/humidity")
        print("Shaders", self.shaders)
        print("Boiler", self.boiler)
        print("Sprinklers", self.sprinklers)
        self.boilerState = self._getBoilerState()


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

    def setShaderOpening(self, shaderId, value):
        shader = "Shader_" + shaderId
        uri = self._getUriById(self.shaders, shader)
        if uri:
            print("SetShaderOpening", m2m.setValue(uri, value))

    @property
    def boilerState(self):
        return self.boilerState

    def _getBoilerState(self):
        fuel = m2m.getSensorLastValue('/mn-cse/mn-name/Temperature/Boiler_Fuel_Level')
        pressure = m2m.getSensorLastValue('/mn-cse/mn-name/Temperature/Boiler_Pressure')
        status = m2m.getSensorLastValue('/mn-cse/mn-name/Temperature/Boiler_Status')

        print(fuel, pressure, status)

        statusStr = True if status == "ON" else False
        return {'status': statusStr, 'pressure': pressure, 'fuel': fuel}
            
    def setBoilerTemperature(self, value):
        print("Set boiler temperature", value)
        if self.boiler:
            print(m2m.setValue(self.boiler, value))

    def setSprinklerStatus(self, sprinklerId, status):
        sprinkler = "Sprinkler_" + sprinklerId
        uri = self._getUriById(self.sprinklers, sprinkler)
        if uri:
            print("SprinklerUri", m2m.setValue(uri, status.upper()))
        
    def _getUriById(self, uris, resource):
        for s in uris:
            if resource == s.split("/")[-1]:
                return s
        return None

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
            'averageTemperature': self.getSensorsAverage('temperature'),
            'averageHumidity': self.getSensorsAverage('humidity'),
            'averageLuminosity': self.getSensorsAverage('luminosity'),
            'boiler': {
                'pressure': random.randint(0, 100),
                'fuel': random.randint(0, 100)
            }
        }
        return json.dumps(overview)
