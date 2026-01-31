import { XMLParser } from "fast-xml-parser";
import { PacketParser } from ".";
import fs from "fs";
import path from "path";
import isDev from "electron-is-dev";
import { debug } from "../../sendMessage";
import { getDataFromFragments, PacketCommand } from "../packet";
import { TypedEventEmitter } from "./TypedEventEmitter";

// Resolve lidgren base directory
const lidgrenBasePath = isDev
  ? path.join(__dirname, "../bin/lidgren/publish") // or "../../../bin/..." for ServerGumpShow.ts
  : path.join((process as any).resourcesPath, "bin/lidgren/publish");

// Prefer CommonJS entrypoint for require()
const candidates = [
  path.join(lidgrenBasePath, "node-lidgren.cjs"),
  path.join(lidgrenBasePath, "node-lidgren.js"),
  path.join(lidgrenBasePath, "node-lidgren", "index.js"),
];

const lidgrenEntry = candidates.find(fs.existsSync);
if (!lidgrenEntry) {
  throw new Error(`node-lidgren entry not found. Tried:\n${candidates.join("\n")}`);
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { NodeLidgren } = require(lidgrenEntry);

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
