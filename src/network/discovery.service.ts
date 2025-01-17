import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import * as dgram from 'dgram';
import { networkInterfaces } from 'os';

interface STATUS {
  ethernet_mac?: string;
  wifi_mac?: string;
  host?: string;
  wifi?: string;
  eth?: string;
  mobile?: string;
}

@Injectable()
export class DiscoveryService {
  private port = 5555;
  private client;

  constructor() {
    console.log('discovery init');
    this.client = dgram.createSocket('udp4');
    
    this.client.on('listening', this.onListening.bind(this));
    
    this.client.on('message', this.onMessage.bind(this));
    this.client.bind(5555);
  }
  async onListening(){
      this.client.setBroadcast(true)
      console.log("listening")
  }
  async onMessage(message, rinfo) {
    console.log(message)
    const payload = await this.networkStatus();
    this.client.send(
      JSON.stringify(payload),
      0,
      JSON.stringify(payload).length,
      this.port,
      rinfo.address,
    );
  }

  async networkStatus() {
    try {
      const hostname = execSync('sudo hostname').toString();
      const interfaceDetails = await networkInterfaces();
      const wlan0_ip = interfaceDetails['wlan0'][0].address;
      const eth0_ip = interfaceDetails['eth0']
        ? interfaceDetails['eth0'][0].address
        : '--';
      const ethernet_mac = interfaceDetails['eth0']
        ? interfaceDetails['eth0'][0].mac
        : '--';
      const wifi_mac = interfaceDetails['wlan0']
        ? interfaceDetails['wlan0'][0].mac
        : '--';
      const mobile_ip = interfaceDetails['ppp0']
        ? interfaceDetails['ppp0'][0].address
        : '--';
      console.log(wlan0_ip, eth0_ip);
      return {
        hostname,
        wifi_mac,
        ethernet_mac,
        wifi: wlan0_ip,
        eth: eth0_ip,
        mobile: mobile_ip,
      };
    } catch (error) {
      return {
        ethernet_mac: '',
        wifi_mac: '',
        host: '',
        wifi: '',
        eth: '',
        mobile: '',
      };
    }
  }
}
