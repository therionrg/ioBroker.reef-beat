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

## Changelog
### 0.1.6 (2025-12-08)

- Start timer set maint to false only when it was set to true

### 0.1.5 (2025-11-29)

- Removed Sentry

### 0.1.4 (2025-11-29)

- Corrections on deployment script

### 0.1.3 (2025-11-29)

- Corrections on deployment script

### 0.1.2 (2025-11-29)

- Enabled autoamtic npm package

### 0.1.1 (2025-11-29)

- Try using release script

### 0.1.0 (2025-11-29)

- Major update with new features

## License

MIT License

Copyright (c) 2025 therionrg <tryx@gmx.ch>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
