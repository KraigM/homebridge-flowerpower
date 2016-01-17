# homebridge-flowerpower
[Parrot Flower Power](http://www.parrot.com/usa/products/flower-power/) plugin for [Homebridge](https://github.com/nfarina/homebridge)

This plugin allows you to connect your Parrot Flower Power sensors to HomeBridge.  Currently, it only allows you to access the sensors like air temperature, as well as the standard system data.

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-flowerpower
3. Update your configuration file. See sample config.json snippet below. 

# Configuration

Configuration sample:

 ```
	"platforms": [
		{
			"platform": "FlowerPower",
			"name": "Flower Power"
		}
	]
```

Fields: 

* "platform": Must always be "FlowerPower" (required)
* "name": Can be anything (required)

