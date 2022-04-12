/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";
import { VerificationMethod, Service } from "./did";

export const protobufPackage = "cheqdid.cheqdnode.cheqd.v1";

/** this line is used by starport scaffolding # proto/tx/message */
export interface MsgCreateDid {
  payload?: MsgCreateDidPayload;
  signatures: SignInfo[];
}

export interface MsgUpdateDid {
  payload?: MsgUpdateDidPayload;
  signatures: SignInfo[];
}

export interface SignInfo {
  verificationMethodId: string;
  signature: string;
}

export interface MsgCreateDidPayload {
  context: string[];
  id: string;
  controller: string[];
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
  capabilityInvocation: string[];
  capabilityDelegation: string[];
  keyAgreement: string[];
  alsoKnownAs: string[];
  service: Service[];
}

export interface MsgCreateDidResponse {
  /** Not necessary */
  id: string;
}

export interface MsgUpdateDidPayload {
  context: string[];
  id: string;
  controller: string[];
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
  capabilityInvocation: string[];
  capabilityDelegation: string[];
  keyAgreement: string[];
  alsoKnownAs: string[];
  service: Service[];
  versionId: string;
}

export interface MsgUpdateDidResponse {
  /** Not necessary */
  id: string;
}

function createBaseMsgCreateDid(): MsgCreateDid {
  return { payload: undefined, signatures: [] };
}

export const MsgCreateDid = {
  encode(
    message: MsgCreateDid,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.payload !== undefined) {
      MsgCreateDidPayload.encode(
        message.payload,
        writer.uint32(10).fork()
      ).ldelim();
    }
    for (const v of message.signatures) {
      SignInfo.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateDid {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateDid();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.payload = MsgCreateDidPayload.decode(reader, reader.uint32());
          break;
        case 2:
          message.signatures.push(SignInfo.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgCreateDid {
    return {
      payload: isSet(object.payload)
        ? MsgCreateDidPayload.fromJSON(object.payload)
        : undefined,
      signatures: Array.isArray(object?.signatures)
        ? object.signatures.map((e: any) => SignInfo.fromJSON(e))
        : [],
    };
  },

  toJSON(message: MsgCreateDid): unknown {
    const obj: any = {};
    message.payload !== undefined &&
      (obj.payload = message.payload
        ? MsgCreateDidPayload.toJSON(message.payload)
        : undefined);
    if (message.signatures) {
      obj.signatures = message.signatures.map((e) =>
        e ? SignInfo.toJSON(e) : undefined
      );
    } else {
      obj.signatures = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<MsgCreateDid>): MsgCreateDid {
    const message = createBaseMsgCreateDid();
    message.payload =
      object.payload !== undefined && object.payload !== null
        ? MsgCreateDidPayload.fromPartial(object.payload)
        : undefined;
    message.signatures =
      object.signatures?.map((e) => SignInfo.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMsgUpdateDid(): MsgUpdateDid {
  return { payload: undefined, signatures: [] };
}

export const MsgUpdateDid = {
  encode(
    message: MsgUpdateDid,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.payload !== undefined) {
      MsgUpdateDidPayload.encode(
        message.payload,
        writer.uint32(10).fork()
      ).ldelim();
    }
    for (const v of message.signatures) {
      SignInfo.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateDid {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateDid();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.payload = MsgUpdateDidPayload.decode(reader, reader.uint32());
          break;
        case 2:
          message.signatures.push(SignInfo.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgUpdateDid {
    return {
      payload: isSet(object.payload)
        ? MsgUpdateDidPayload.fromJSON(object.payload)
        : undefined,
      signatures: Array.isArray(object?.signatures)
        ? object.signatures.map((e: any) => SignInfo.fromJSON(e))
        : [],
    };
  },

  toJSON(message: MsgUpdateDid): unknown {
    const obj: any = {};
    message.payload !== undefined &&
      (obj.payload = message.payload
        ? MsgUpdateDidPayload.toJSON(message.payload)
        : undefined);
    if (message.signatures) {
      obj.signatures = message.signatures.map((e) =>
        e ? SignInfo.toJSON(e) : undefined
      );
    } else {
      obj.signatures = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgUpdateDid>, I>>(
    object: I
  ): MsgUpdateDid {
    const message = createBaseMsgUpdateDid();
    message.payload =
      object.payload !== undefined && object.payload !== null
        ? MsgUpdateDidPayload.fromPartial(object.payload)
        : undefined;
    message.signatures =
      object.signatures?.map((e) => SignInfo.fromPartial(e)) || [];
    return message;
  },
};

function createBaseSignInfo(): SignInfo {
  return { verificationMethodId: "", signature: "" };
}

export const SignInfo = {
  encode(
    message: SignInfo,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.verificationMethodId !== "") {
      writer.uint32(10).string(message.verificationMethodId);
    }
    if (message.signature !== "") {
      writer.uint32(18).string(message.signature);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SignInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSignInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.verificationMethodId = reader.string();
          break;
        case 2:
          message.signature = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SignInfo {
    return {
      verificationMethodId: isSet(object.verificationMethodId)
        ? String(object.verificationMethodId)
        : "",
      signature: isSet(object.signature) ? String(object.signature) : "",
    };
  },

  toJSON(message: SignInfo): unknown {
    const obj: any = {};
    message.verificationMethodId !== undefined &&
      (obj.verificationMethodId = message.verificationMethodId);
    message.signature !== undefined && (obj.signature = message.signature);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<SignInfo>, I>>(object: I): SignInfo {
    const message = createBaseSignInfo();
    message.verificationMethodId = object.verificationMethodId ?? "";
    message.signature = object.signature ?? "";
    return message;
  },
};

function createBaseMsgCreateDidPayload(): MsgCreateDidPayload {
  return {
    context: [],
    id: "",
    controller: [],
    verificationMethod: [],
    authentication: [],
    assertionMethod: [],
    capabilityInvocation: [],
    capabilityDelegation: [],
    keyAgreement: [],
    alsoKnownAs: [],
    service: [],
  };
}

export const MsgCreateDidPayload = {
  encode(
    message: MsgCreateDidPayload,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.context) {
      writer.uint32(10).string(v!);
    }
    if (message.id !== "") {
      writer.uint32(18).string(message.id);
    }
    for (const v of message.controller) {
      writer.uint32(26).string(v!);
    }
    for (const v of message.verificationMethod) {
      VerificationMethod.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.authentication) {
      writer.uint32(42).string(v!);
    }
    for (const v of message.assertionMethod) {
      writer.uint32(50).string(v!);
    }
    for (const v of message.capabilityInvocation) {
      writer.uint32(58).string(v!);
    }
    for (const v of message.capabilityDelegation) {
      writer.uint32(66).string(v!);
    }
    for (const v of message.keyAgreement) {
      writer.uint32(74).string(v!);
    }
    for (const v of message.alsoKnownAs) {
      writer.uint32(82).string(v!);
    }
    for (const v of message.service) {
      Service.encode(v!, writer.uint32(90).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateDidPayload {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateDidPayload();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.context.push(reader.string());
          break;
        case 2:
          message.id = reader.string();
          break;
        case 3:
          message.controller.push(reader.string());
          break;
        case 4:
          message.verificationMethod.push(
            VerificationMethod.decode(reader, reader.uint32())
          );
          break;
        case 5:
          message.authentication.push(reader.string());
          break;
        case 6:
          message.assertionMethod.push(reader.string());
          break;
        case 7:
          message.capabilityInvocation.push(reader.string());
          break;
        case 8:
          message.capabilityDelegation.push(reader.string());
          break;
        case 9:
          message.keyAgreement.push(reader.string());
          break;
        case 10:
          message.alsoKnownAs.push(reader.string());
          break;
        case 11:
          message.service.push(Service.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgCreateDidPayload {
    return {
      context: Array.isArray(object?.context)
        ? object.context.map((e: any) => String(e))
        : [],
      id: isSet(object.id) ? String(object.id) : "",
      controller: Array.isArray(object?.controller)
        ? object.controller.map((e: any) => String(e))
        : [],
      verificationMethod: Array.isArray(object?.verificationMethod)
        ? object.verificationMethod.map((e: any) =>
            VerificationMethod.fromJSON(e)
          )
        : [],
      authentication: Array.isArray(object?.authentication)
        ? object.authentication.map((e: any) => String(e))
        : [],
      assertionMethod: Array.isArray(object?.assertionMethod)
        ? object.assertionMethod.map((e: any) => String(e))
        : [],
      capabilityInvocation: Array.isArray(object?.capabilityInvocation)
        ? object.capabilityInvocation.map((e: any) => String(e))
        : [],
      capabilityDelegation: Array.isArray(object?.capabilityDelegation)
        ? object.capabilityDelegation.map((e: any) => String(e))
        : [],
      keyAgreement: Array.isArray(object?.keyAgreement)
        ? object.keyAgreement.map((e: any) => String(e))
        : [],
      alsoKnownAs: Array.isArray(object?.alsoKnownAs)
        ? object.alsoKnownAs.map((e: any) => String(e))
        : [],
      service: Array.isArray(object?.service)
        ? object.service.map((e: any) => Service.fromJSON(e))
        : [],
    };
  },

  toJSON(message: MsgCreateDidPayload): unknown {
    const obj: any = {};
    if (message.context) {
      obj.context = message.context.map((e) => e);
    } else {
      obj.context = [];
    }
    message.id !== undefined && (obj.id = message.id);
    if (message.controller) {
      obj.controller = message.controller.map((e) => e);
    } else {
      obj.controller = [];
    }
    if (message.verificationMethod) {
      obj.verificationMethod = message.verificationMethod.map((e) =>
        e ? VerificationMethod.toJSON(e) : undefined
      );
    } else {
      obj.verificationMethod = [];
    }
    if (message.authentication) {
      obj.authentication = message.authentication.map((e) => e);
    } else {
      obj.authentication = [];
    }
    if (message.assertionMethod) {
      obj.assertionMethod = message.assertionMethod.map((e) => e);
    } else {
      obj.assertionMethod = [];
    }
    if (message.capabilityInvocation) {
      obj.capabilityInvocation = message.capabilityInvocation.map((e) => e);
    } else {
      obj.capabilityInvocation = [];
    }
    if (message.capabilityDelegation) {
      obj.capabilityDelegation = message.capabilityDelegation.map((e) => e);
    } else {
      obj.capabilityDelegation = [];
    }
    if (message.keyAgreement) {
      obj.keyAgreement = message.keyAgreement.map((e) => e);
    } else {
      obj.keyAgreement = [];
    }
    if (message.alsoKnownAs) {
      obj.alsoKnownAs = message.alsoKnownAs.map((e) => e);
    } else {
      obj.alsoKnownAs = [];
    }
    if (message.service) {
      obj.service = message.service.map((e) =>
        e ? Service.toJSON(e) : undefined
      );
    } else {
      obj.service = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgCreateDidPayload>, I>>(
    object: I
  ): MsgCreateDidPayload {
    const message = createBaseMsgCreateDidPayload();
    message.context = object.context?.map((e) => e) || [];
    message.id = object.id ?? "";
    message.controller = object.controller?.map((e) => e) || [];
    message.verificationMethod =
      object.verificationMethod?.map((e) =>
        VerificationMethod.fromPartial(e)
      ) || [];
    message.authentication = object.authentication?.map((e) => e) || [];
    message.assertionMethod = object.assertionMethod?.map((e) => e) || [];
    message.capabilityInvocation =
      object.capabilityInvocation?.map((e) => e) || [];
    message.capabilityDelegation =
      object.capabilityDelegation?.map((e) => e) || [];
    message.keyAgreement = object.keyAgreement?.map((e) => e) || [];
    message.alsoKnownAs = object.alsoKnownAs?.map((e) => e) || [];
    message.service = object.service?.map((e) => Service.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMsgCreateDidResponse(): MsgCreateDidResponse {
  return { id: "" };
}

export const MsgCreateDidResponse = {
  encode(
    message: MsgCreateDidResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCreateDidResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateDidResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgCreateDidResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
    };
  },

  toJSON(message: MsgCreateDidResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgCreateDidResponse>, I>>(
    object: I
  ): MsgCreateDidResponse {
    const message = createBaseMsgCreateDidResponse();
    message.id = object.id ?? "";
    return message;
  },
};

function createBaseMsgUpdateDidPayload(): MsgUpdateDidPayload {
  return {
    context: [],
    id: "",
    controller: [],
    verificationMethod: [],
    authentication: [],
    assertionMethod: [],
    capabilityInvocation: [],
    capabilityDelegation: [],
    keyAgreement: [],
    alsoKnownAs: [],
    service: [],
    versionId: "",
  };
}

export const MsgUpdateDidPayload = {
  encode(
    message: MsgUpdateDidPayload,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.context) {
      writer.uint32(10).string(v!);
    }
    if (message.id !== "") {
      writer.uint32(18).string(message.id);
    }
    for (const v of message.controller) {
      writer.uint32(26).string(v!);
    }
    for (const v of message.verificationMethod) {
      VerificationMethod.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.authentication) {
      writer.uint32(42).string(v!);
    }
    for (const v of message.assertionMethod) {
      writer.uint32(50).string(v!);
    }
    for (const v of message.capabilityInvocation) {
      writer.uint32(58).string(v!);
    }
    for (const v of message.capabilityDelegation) {
      writer.uint32(66).string(v!);
    }
    for (const v of message.keyAgreement) {
      writer.uint32(74).string(v!);
    }
    for (const v of message.alsoKnownAs) {
      writer.uint32(82).string(v!);
    }
    for (const v of message.service) {
      Service.encode(v!, writer.uint32(90).fork()).ldelim();
    }
    if (message.versionId !== "") {
      writer.uint32(98).string(message.versionId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateDidPayload {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateDidPayload();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.context.push(reader.string());
          break;
        case 2:
          message.id = reader.string();
          break;
        case 3:
          message.controller.push(reader.string());
          break;
        case 4:
          message.verificationMethod.push(
            VerificationMethod.decode(reader, reader.uint32())
          );
          break;
        case 5:
          message.authentication.push(reader.string());
          break;
        case 6:
          message.assertionMethod.push(reader.string());
          break;
        case 7:
          message.capabilityInvocation.push(reader.string());
          break;
        case 8:
          message.capabilityDelegation.push(reader.string());
          break;
        case 9:
          message.keyAgreement.push(reader.string());
          break;
        case 10:
          message.alsoKnownAs.push(reader.string());
          break;
        case 11:
          message.service.push(Service.decode(reader, reader.uint32()));
          break;
        case 12:
          message.versionId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgUpdateDidPayload {
    return {
      context: Array.isArray(object?.context)
        ? object.context.map((e: any) => String(e))
        : [],
      id: isSet(object.id) ? String(object.id) : "",
      controller: Array.isArray(object?.controller)
        ? object.controller.map((e: any) => String(e))
        : [],
      verificationMethod: Array.isArray(object?.verificationMethod)
        ? object.verificationMethod.map((e: any) =>
            VerificationMethod.fromJSON(e)
          )
        : [],
      authentication: Array.isArray(object?.authentication)
        ? object.authentication.map((e: any) => String(e))
        : [],
      assertionMethod: Array.isArray(object?.assertionMethod)
        ? object.assertionMethod.map((e: any) => String(e))
        : [],
      capabilityInvocation: Array.isArray(object?.capabilityInvocation)
        ? object.capabilityInvocation.map((e: any) => String(e))
        : [],
      capabilityDelegation: Array.isArray(object?.capabilityDelegation)
        ? object.capabilityDelegation.map((e: any) => String(e))
        : [],
      keyAgreement: Array.isArray(object?.keyAgreement)
        ? object.keyAgreement.map((e: any) => String(e))
        : [],
      alsoKnownAs: Array.isArray(object?.alsoKnownAs)
        ? object.alsoKnownAs.map((e: any) => String(e))
        : [],
      service: Array.isArray(object?.service)
        ? object.service.map((e: any) => Service.fromJSON(e))
        : [],
      versionId: isSet(object.versionId) ? String(object.versionId) : "",
    };
  },

  toJSON(message: MsgUpdateDidPayload): unknown {
    const obj: any = {};
    if (message.context) {
      obj.context = message.context.map((e) => e);
    } else {
      obj.context = [];
    }
    message.id !== undefined && (obj.id = message.id);
    if (message.controller) {
      obj.controller = message.controller.map((e) => e);
    } else {
      obj.controller = [];
    }
    if (message.verificationMethod) {
      obj.verificationMethod = message.verificationMethod.map((e) =>
        e ? VerificationMethod.toJSON(e) : undefined
      );
    } else {
      obj.verificationMethod = [];
    }
    if (message.authentication) {
      obj.authentication = message.authentication.map((e) => e);
    } else {
      obj.authentication = [];
    }
    if (message.assertionMethod) {
      obj.assertionMethod = message.assertionMethod.map((e) => e);
    } else {
      obj.assertionMethod = [];
    }
    if (message.capabilityInvocation) {
      obj.capabilityInvocation = message.capabilityInvocation.map((e) => e);
    } else {
      obj.capabilityInvocation = [];
    }
    if (message.capabilityDelegation) {
      obj.capabilityDelegation = message.capabilityDelegation.map((e) => e);
    } else {
      obj.capabilityDelegation = [];
    }
    if (message.keyAgreement) {
      obj.keyAgreement = message.keyAgreement.map((e) => e);
    } else {
      obj.keyAgreement = [];
    }
    if (message.alsoKnownAs) {
      obj.alsoKnownAs = message.alsoKnownAs.map((e) => e);
    } else {
      obj.alsoKnownAs = [];
    }
    if (message.service) {
      obj.service = message.service.map((e) =>
        e ? Service.toJSON(e) : undefined
      );
    } else {
      obj.service = [];
    }
    message.versionId !== undefined && (obj.versionId = message.versionId);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgUpdateDidPayload>, I>>(
    object: I
  ): MsgUpdateDidPayload {
    const message = createBaseMsgUpdateDidPayload();
    message.context = object.context?.map((e) => e) || [];
    message.id = object.id ?? "";
    message.controller = object.controller?.map((e) => e) || [];
    message.verificationMethod =
      object.verificationMethod?.map((e) =>
        VerificationMethod.fromPartial(e)
      ) || [];
    message.authentication = object.authentication?.map((e) => e) || [];
    message.assertionMethod = object.assertionMethod?.map((e) => e) || [];
    message.capabilityInvocation =
      object.capabilityInvocation?.map((e) => e) || [];
    message.capabilityDelegation =
      object.capabilityDelegation?.map((e) => e) || [];
    message.keyAgreement = object.keyAgreement?.map((e) => e) || [];
    message.alsoKnownAs = object.alsoKnownAs?.map((e) => e) || [];
    message.service = object.service?.map((e) => Service.fromPartial(e)) || [];
    message.versionId = object.versionId ?? "";
    return message;
  },
};

function createBaseMsgUpdateDidResponse(): MsgUpdateDidResponse {
  return { id: "" };
}

export const MsgUpdateDidResponse = {
  encode(
    message: MsgUpdateDidResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUpdateDidResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateDidResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgUpdateDidResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
    };
  },

  toJSON(message: MsgUpdateDidResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MsgUpdateDidResponse>, I>>(
    object: I
  ): MsgUpdateDidResponse {
    const message = createBaseMsgUpdateDidResponse();
    message.id = object.id ?? "";
    return message;
  },
};

/** Msg defines the Msg service. */
export interface Msg {
  CreateDid(request: MsgCreateDid): Promise<MsgCreateDidResponse>;
  UpdateDid(request: MsgUpdateDid): Promise<MsgUpdateDidResponse>;
}

export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.CreateDid = this.CreateDid.bind(this);
    this.UpdateDid = this.UpdateDid.bind(this);
  }
  CreateDid(request: MsgCreateDid): Promise<MsgCreateDidResponse> {
    const data = MsgCreateDid.encode(request).finish();
    const promise = this.rpc.request(
      "cheqdid.cheqdnode.cheqd.v1.Msg",
      "CreateDid",
      data
    );
    return promise.then((data) =>
      MsgCreateDidResponse.decode(new _m0.Reader(data))
    );
  }

  UpdateDid(request: MsgUpdateDid): Promise<MsgUpdateDidResponse> {
    const data = MsgUpdateDid.encode(request).finish();
    const promise = this.rpc.request(
      "cheqdid.cheqdnode.cheqd.v1.Msg",
      "UpdateDid",
      data
    );
    return promise.then((data) =>
      MsgUpdateDidResponse.decode(new _m0.Reader(data))
    );
  }
}

interface Rpc {
  request(
    service: string,
    method: string,
    data: Uint8Array
  ): Promise<Uint8Array>;
}

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
