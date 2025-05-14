export class NodeLidgren {
	constructor(hex: string);
  
	// Read operations
	readBoolean(): boolean;
	readByte(): number;
	readBytes(count: number): Uint8Array;
	readInt16(): number;
	readInt32(): number;
	readInt64(): bigint;
	readFloat(): number;
	readDouble(): number;
	readString(): string;
  
	// Write operations
	writeBoolean(value: boolean): void;
	writeByte(value: number): void;
	writeBytes(value: Uint8Array): void;
	writeInt16(value: number): void;
	writeInt32(value: number): void;
	writeInt64(value: bigint): void;
	writeFloat(value: number): void;
	writeDouble(value: number): void;
	writeString(value: string): void;
  
	// Other utilities
	getData(): Uint8Array;
	decompress(input: Uint8Array): string;
	destroy(): void;
  }
  