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
                    
        self.temperatureSensors = m2m.getTemperatureSensors()
        self.luminositySensors = m2m.getLuminositySensors()
        self.humiditySensors = m2m.getHumiditySensors()

        temperatureHistory = m2m.getSensorHistory(
            self.temperatureSensors[self.temperatureSensors.keys()[0]])

        print(temperatureHistory)

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
            'averageTemperature': self.averageTemperature,
            'averageHumidity': random.randint(0, 110),
            'averageLuminosity': random.randint(0, 100),
            'boiler': {
                'pressure': random.randint(0, 100),
                'fuel': random.randint(0, 100)
            }
        }
        return json.dumps(overview)
