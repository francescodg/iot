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
                'history': m2m.getSensorHistory(sensorUris[s]),
                'lastValue': m2m.getSensorLastValue(sensorUris[s])
            })
        return sensors

        
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
