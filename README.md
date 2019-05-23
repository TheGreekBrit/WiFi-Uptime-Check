#!/bin/bash
cd /mnt/d/Projects/javascript/wifi-uptime/
node testwifi.js 2>&1 >> ./uptime.log &
