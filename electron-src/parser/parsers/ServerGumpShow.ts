import { XMLParser } from 'fast-xml-parser';
import { PacketParser } from '.';
import * as path from 'path';
import * as fs from 'fs';

const lidgrenPath = path.join(
  process.resourcesPath,
  '..',
  'bin',
  'lidgren',
  'publish',
  'node-lidgren.cjs'
);

if (!fs.existsSync(lidgrenPath)) {
  throw new Error('Native Lidgren module not found: ' + lidgrenPath);
}

const { NodeLidgren } = require(lidgrenPath);
import { debug } from '../../sendMessage';
import { getDataFromFragments, PacketCommand } from '../packet';
import { TypedEventEmitter } from './TypedEventEmitter';

type ServerGumpShowEventTypes = {
    onMessage: [message: any, id: number];
};

export const ServerGumpShowEventBroker =
    new TypedEventEmitter<ServerGumpShowEventTypes>();

const parser: PacketParser = (packets, _rinfo): void => {
    try {
        const msgPackets = packets.filter((packet) => packet?.type === 0x44);
        for (const packet of msgPackets) {
            if (packet?.data) {
                const data = getDataFromFragments(packet);
                if (!data) {
                    return;
                }
                const dataType = data.readUint16LE();
                if (dataType === PacketCommand.ServerGumpShow) {
                    const packetData = new NodeLidgren(data.toString('hex'));
                    packetData.readInt16(); // command
                    // debug(command.toString(16));
                    const serial = packetData.readInt32(); // serial
                    // debug(serial.toString(16));
                    packetData.readBoolean(); // overlay
                    // debug(`${overlay}`);
                    const size = packetData.readInt32();
                    // debug(size.toString());
                    const compressedData = packetData.readBytes(size);
                    const decompressedData =
                        packetData.decompress(compressedData);
                    // debug(decompressedData);
                    const parser = new XMLParser();
                    const dataObj = parser.parse(decompressedData);
                    ServerGumpShowEventBroker.emit(
                        'onMessage',
                        dataObj,
                        serial,
                    );
                }
            }
        }
    } catch (err) {
        debug(`ServerGumpShow: ${err}`);
        throw err;
    }
};

export default parser;
