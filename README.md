![Logo](admin/reef-beat.png)

# ioBroker.reef-beat

[![NPM version](https://img.shields.io/npm/v/iobroker.reef-beat.svg)](https://www.npmjs.com/package/iobroker.reef-beat)
[![Downloads](https://img.shields.io/npm/dm/iobroker.reef-beat.svg)](https://www.npmjs.com/package/iobroker.reef-beat)
![Number of Installations](https://iobroker.live/badges/reef-beat-installed.svg)  
![Current version in stable repository](https://iobroker.live/badges/reef-beat-stable.svg)  
[![NPM](https://nodei.co/npm/iobroker.reef-beat.png?downloads=true)](https://nodei.co/npm/iobroker.reef-beat/)  
**Tests:** ![Test and Release](https://github.com/therionrg/ioBroker.reef-beat/workflows/Test%20and%20Release/badge.svg)

---

## Overview 🐠

`ioBroker.reef-beat` is an **ioBroker adapter** for integrating and monitoring **RedSea devices**.  
It allows you to access device data and control specific functions while integrating them into your ioBroker system.

### Key Points

- **Local support:** `ATO+`, `ReefRun`, `ReefMat`, `ReefDose`
- **Cloud support:** All RedSea devices
- **Data points:** All are **read-only** except for `feed` and `maintenance mode`

> Note: ReefLight is currently **not supported locally**.

---

## Features

- Read status and measurement values from supported devices
- Local control of `feed` and `maintenance mode`
- Cloud device integration (read-only)
- Automatic device detection (local or cloud)
- Integration into ioBroker visualizations and scripts

---

## Requirements

- ioBroker **>= 5.x**
- Node.js **>= 18.x**
- Network access to local devices (for local control) and/or cloud
- Optional: basic knowledge of ioBroker for configuration and automation

---

## Installation

### Via Admin Interface

1. Open ioBroker Admin and click **Add adapter**
2. Search for `reef-beat`
3. Install the adapter and configure it

### Via Command Line

```bash
cd /opt/iobroker
npm install iobroker.reef-beat
```
