/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";
import { Any } from "../../google/protobuf/any";

export const protobufPackage = "cheqdid.cheqdnode.cheqd.v1";

export interface StateValue {
  data?: Any;
  /** optional */
  metadata?: Metadata;
}

/** metadata */
export interface Metadata {
  created: string;
  updated: string;
  deactivated: boolean;
  versionId: string;
}

function createBaseStateValue(): StateValue {
  return { data: undefined, metadata: undefined };
}

export const StateValue = {
  encode(
    message: StateValue,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.data !== undefined) {
      Any.encode(message.data, writer.uint32(10).fork()).ldelim();
    }
    if (message.metadata !== undefined) {
      Metadata.encode(message.metadata, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StateValue {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStateValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.data = Any.decode(reader, reader.uint32());
          break;
        case 2:
          message.metadata = Metadata.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StateValue {
    return {
      data: isSet(object.data) ? Any.fromJSON(object.data) : undefined,
      metadata: isSet(object.metadata)
        ? Metadata.fromJSON(object.metadata)
        : undefined,
    };
  },

  toJSON(message: StateValue): unknown {
    const obj: any = {};
    message.data !== undefined &&
      (obj.data = message.data ? Any.toJSON(message.data) : undefined);
    message.metadata !== undefined &&
      (obj.metadata = message.metadata
        ? Metadata.toJSON(message.metadata)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<StateValue>, I>>(
    object: I
  ): StateValue {
    const message = createBaseStateValue();
    message.data =
      object.data !== undefined && object.data !== null
        ? Any.fromPartial(object.data)
        : undefined;
    message.metadata =
      object.metadata !== undefined && object.metadata !== null
        ? Metadata.fromPartial(object.metadata)
        : undefined;
    return message;
  },
};

function createBaseMetadata(): Metadata {
  return { created: "", updated: "", deactivated: false, versionId: "" };
}

export const Metadata = {
  encode(
    message: Metadata,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.created !== "") {
      writer.uint32(10).string(message.created);
    }
    if (message.updated !== "") {
      writer.uint32(18).string(message.updated);
    }
    if (message.deactivated === true) {
      writer.uint32(24).bool(message.deactivated);
    }
    if (message.versionId !== "") {
      writer.uint32(34).string(message.versionId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Metadata {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.created = reader.string();
          break;
        case 2:
          message.updated = reader.string();
          break;
        case 3:
          message.deactivated = reader.bool();
          break;
        case 4:
          message.versionId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Metadata {
    return {
      created: isSet(object.created) ? String(object.created) : "",
      updated: isSet(object.updated) ? String(object.updated) : "",
      deactivated: isSet(object.deactivated)
        ? Boolean(object.deactivated)
        : false,
      versionId: isSet(object.versionId) ? String(object.versionId) : "",
    };
  },

  toJSON(message: Metadata): unknown {
    const obj: any = {};
    message.created !== undefined && (obj.created = message.created);
    message.updated !== undefined && (obj.updated = message.updated);
    message.deactivated !== undefined &&
      (obj.deactivated = message.deactivated);
    message.versionId !== undefined && (obj.versionId = message.versionId);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Metadata>, I>>(object: I): Metadata {
    const message = createBaseMetadata();
    message.created = object.created ?? "";
    message.updated = object.updated ?? "";
    message.deactivated = object.deactivated ?? false;
    message.versionId = object.versionId ?? "";
    return message;
  },
};

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Long
  ? string | number | Long
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<
        Exclude<keyof I, KeysOfUnion<P>>,
        never
      >;

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
