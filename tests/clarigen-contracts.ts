export type ClarityAbiTypeBuffer = { buffer: { length: number } };
export type ClarityAbiTypeStringAscii = { "string-ascii": { length: number } };
export type ClarityAbiTypeStringUtf8 = { "string-utf8": { length: number } };
export type ClarityAbiTypeResponse = {
  response: { ok: ClarityAbiType; error: ClarityAbiType };
};
export type ClarityAbiTypeOptional = { optional: ClarityAbiType };
export type ClarityAbiTypeTuple = {
  tuple: { name: string; type: ClarityAbiType }[];
};
export type ClarityAbiTypeList = {
  list: { type: ClarityAbiType; length: number };
};

export type ClarityAbiTypeUInt128 = "uint128";
export type ClarityAbiTypeInt128 = "int128";
export type ClarityAbiTypeBool = "bool";
export type ClarityAbiTypePrincipal = "principal";
export type ClarityAbiTypeTraitReference = "trait_reference";
export type ClarityAbiTypeNone = "none";

export type ClarityAbiTypePrimitive =
  | ClarityAbiTypeUInt128
  | ClarityAbiTypeInt128
  | ClarityAbiTypeBool
  | ClarityAbiTypePrincipal
  | ClarityAbiTypeTraitReference
  | ClarityAbiTypeNone;

export type ClarityAbiType =
  | ClarityAbiTypePrimitive
  | ClarityAbiTypeBuffer
  | ClarityAbiTypeResponse
  | ClarityAbiTypeOptional
  | ClarityAbiTypeTuple
  | ClarityAbiTypeList
  | ClarityAbiTypeStringAscii
  | ClarityAbiTypeStringUtf8
  | ClarityAbiTypeTraitReference;

export interface ClarityAbiArg {
  name: string;
  type: ClarityAbiType;
}

export interface ClarityAbiFunction {
  name: string;
  access: "private" | "public" | "read_only";
  args: ClarityAbiArg[];
  outputs: {
    type: ClarityAbiType;
  };
}

export type TypedAbiArg<T, N extends string> = { _t?: T; name: N };

export type TypedAbiFunction<T extends TypedAbiArg<unknown, string>[], R> =
  & ClarityAbiFunction
  & {
    _t?: T;
    _r?: R;
  };

export interface ClarityAbiVariable {
  name: string;
  access: "variable" | "constant";
  type: ClarityAbiType;
}

export type TypedAbiVariable<T> = ClarityAbiVariable & {
  defaultValue: T;
};

export interface ClarityAbiMap {
  name: string;
  key: ClarityAbiType;
  value: ClarityAbiType;
}

export type TypedAbiMap<K, V> = ClarityAbiMap & {
  _k?: K;
  _v?: V;
};

export interface ClarityAbiTypeFungibleToken {
  name: string;
}

export interface ClarityAbiTypeNonFungibleToken {
  name: string;
  type: ClarityAbiType;
}

export interface ClarityAbi {
  functions: ClarityAbiFunction[];
  variables: ClarityAbiVariable[];
  maps: ClarityAbiMap[];
  fungible_tokens: ClarityAbiTypeFungibleToken[];
  non_fungible_tokens: ClarityAbiTypeNonFungibleToken[];
}

export type TypedAbi = Readonly<{
  functions: {
    [key: string]: TypedAbiFunction<TypedAbiArg<unknown, string>[], unknown>;
  };
  variables: {
    [key: string]: TypedAbiVariable<unknown>;
  };
  maps: {
    [key: string]: TypedAbiMap<unknown, unknown>;
  };
  constants: {
    [key: string]: unknown;
  };
  fungible_tokens: Readonly<ClarityAbiTypeFungibleToken[]>;
  non_fungible_tokens: Readonly<ClarityAbiTypeNonFungibleToken[]>;
  contractName: string;
  contractFile?: string;
}>;

export interface ResponseOk<T, E> {
  value: T;
  isOk: true;
  _e?: E;
}

export interface ResponseErr<T, E> {
  value: E;
  isOk: false;
  _o?: T;
}

export type Response<Ok, Err> = ResponseOk<Ok, Err> | ResponseErr<Ok, Err>;

export type OkType<R> = R extends ResponseOk<infer V, unknown> ? V : never;
export type ErrType<R> = R extends ResponseErr<unknown, infer V> ? V : never;

export const contracts = {
  clarityBitcoin: {
    "functions": {
      buffToU8: {
        "name": "buff-to-u8",
        "access": "read_only",
        "args": [{ "name": "byte", "type": { "buffer": { "length": 1 } } }],
        "outputs": { "type": "uint128" },
      } as TypedAbiFunction<[byte: TypedAbiArg<Uint8Array, "byte">], bigint>,
      getReversedTxid: {
        "name": "get-reversed-txid",
        "access": "read_only",
        "args": [{ "name": "tx", "type": { "buffer": { "length": 1024 } } }],
        "outputs": { "type": { "buffer": { "length": 32 } } },
      } as TypedAbiFunction<[tx: TypedAbiArg<Uint8Array, "tx">], Uint8Array>,
      getTxid: {
        "name": "get-txid",
        "access": "read_only",
        "args": [{ "name": "tx", "type": { "buffer": { "length": 1024 } } }],
        "outputs": { "type": { "buffer": { "length": 32 } } },
      } as TypedAbiFunction<[tx: TypedAbiArg<Uint8Array, "tx">], Uint8Array>,
      innerBuff32Permutation: {
        "name": "inner-buff32-permutation",
        "access": "read_only",
        "args": [{ "name": "target-index", "type": "uint128" }, {
          "name": "state",
          "type": {
            "tuple": [{
              "name": "hash-input",
              "type": { "buffer": { "length": 32 } },
            }, {
              "name": "hash-output",
              "type": { "buffer": { "length": 32 } },
            }],
          },
        }],
        "outputs": {
          "type": {
            "tuple": [{
              "name": "hash-input",
              "type": { "buffer": { "length": 32 } },
            }, {
              "name": "hash-output",
              "type": { "buffer": { "length": 32 } },
            }],
          },
        },
      } as TypedAbiFunction<
        [
          targetIndex: TypedAbiArg<number | bigint, "targetIndex">,
          state: TypedAbiArg<{
            "hashInput": Uint8Array;
            "hashOutput": Uint8Array;
          }, "state">,
        ],
        {
          "hashInput": Uint8Array;
          "hashOutput": Uint8Array;
        }
      >,
      innerMerkleProofVerify: {
        "name": "inner-merkle-proof-verify",
        "access": "read_only",
        "args": [{ "name": "ctr", "type": "uint128" }, {
          "name": "state",
          "type": {
            "tuple": [
              { "name": "cur-hash", "type": { "buffer": { "length": 32 } } },
              { "name": "path", "type": "uint128" },
              {
                "name": "proof-hashes",
                "type": {
                  "list": {
                    "type": { "buffer": { "length": 32 } },
                    "length": 12,
                  },
                },
              },
              { "name": "root-hash", "type": { "buffer": { "length": 32 } } },
              { "name": "tree-depth", "type": "uint128" },
              { "name": "verified", "type": "bool" },
            ],
          },
        }],
        "outputs": {
          "type": {
            "tuple": [
              { "name": "cur-hash", "type": { "buffer": { "length": 32 } } },
              { "name": "path", "type": "uint128" },
              {
                "name": "proof-hashes",
                "type": {
                  "list": {
                    "type": { "buffer": { "length": 32 } },
                    "length": 12,
                  },
                },
              },
              { "name": "root-hash", "type": { "buffer": { "length": 32 } } },
              { "name": "tree-depth", "type": "uint128" },
              { "name": "verified", "type": "bool" },
            ],
          },
        },
      } as TypedAbiFunction<
        [
          ctr: TypedAbiArg<number | bigint, "ctr">,
          state: TypedAbiArg<{
            "curHash": Uint8Array;
            "path": number | bigint;
            "proofHashes": Uint8Array[];
            "rootHash": Uint8Array;
            "treeDepth": number | bigint;
            "verified": boolean;
          }, "state">,
        ],
        {
          "curHash": Uint8Array;
          "path": bigint;
          "proofHashes": Uint8Array[];
          "rootHash": Uint8Array;
          "treeDepth": bigint;
          "verified": boolean;
        }
      >,
      innerReadSlice: {
        "name": "inner-read-slice",
        "access": "read_only",
        "args": [{ "name": "chunk_size", "type": "uint128" }, {
          "name": "input",
          "type": {
            "tuple": [
              { "name": "acc", "type": { "buffer": { "length": 1024 } } },
              { "name": "buffer", "type": { "buffer": { "length": 1024 } } },
              { "name": "index", "type": "uint128" },
              { "name": "remaining", "type": "uint128" },
            ],
          },
        }],
        "outputs": {
          "type": {
            "tuple": [
              { "name": "acc", "type": { "buffer": { "length": 1024 } } },
              { "name": "buffer", "type": { "buffer": { "length": 1024 } } },
              { "name": "index", "type": "uint128" },
              { "name": "remaining", "type": "uint128" },
            ],
          },
        },
      } as TypedAbiFunction<
        [
          chunk_size: TypedAbiArg<number | bigint, "chunk_size">,
          input: TypedAbiArg<{
            "acc": Uint8Array;
            "buffer": Uint8Array;
            "index": number | bigint;
            "remaining": number | bigint;
          }, "input">,
        ],
        {
          "acc": Uint8Array;
          "buffer": Uint8Array;
          "index": bigint;
          "remaining": bigint;
        }
      >,
      innerReadSlice1024: {
        "name": "inner-read-slice-1024",
        "access": "read_only",
        "args": [{ "name": "ignored", "type": "bool" }, {
          "name": "input",
          "type": {
            "tuple": [
              { "name": "acc", "type": { "buffer": { "length": 1024 } } },
              { "name": "data", "type": { "buffer": { "length": 1024 } } },
              { "name": "index", "type": "uint128" },
            ],
          },
        }],
        "outputs": {
          "type": {
            "tuple": [
              { "name": "acc", "type": { "buffer": { "length": 1024 } } },
              { "name": "data", "type": { "buffer": { "length": 1024 } } },
              { "name": "index", "type": "uint128" },
            ],
          },
        },
      } as TypedAbiFunction<
        [
          ignored: TypedAbiArg<boolean, "ignored">,
          input: TypedAbiArg<{
            "acc": Uint8Array;
            "data": Uint8Array;
            "index": number | bigint;
          }, "input">,
        ],
        {
          "acc": Uint8Array;
          "data": Uint8Array;
          "index": bigint;
        }
      >,
      isBitSet: {
        "name": "is-bit-set",
        "access": "read_only",
        "args": [{ "name": "val", "type": "uint128" }, {
          "name": "bit",
          "type": "uint128",
        }],
        "outputs": { "type": "bool" },
      } as TypedAbiFunction<
        [
          val: TypedAbiArg<number | bigint, "val">,
          bit: TypedAbiArg<number | bigint, "bit">,
        ],
        boolean
      >,
      parseBlockHeader: {
        "name": "parse-block-header",
        "access": "read_only",
        "args": [{
          "name": "headerbuff",
          "type": { "buffer": { "length": 80 } },
        }],
        "outputs": {
          "type": {
            "response": {
              "ok": {
                "tuple": [
                  {
                    "name": "merkle-root",
                    "type": { "buffer": { "length": 32 } },
                  },
                  { "name": "nbits", "type": "uint128" },
                  { "name": "nonce", "type": "uint128" },
                  { "name": "parent", "type": { "buffer": { "length": 32 } } },
                  { "name": "timestamp", "type": "uint128" },
                  { "name": "version", "type": "uint128" },
                ],
              },
              "error": "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [headerbuff: TypedAbiArg<Uint8Array, "headerbuff">],
        Response<{
          "merkleRoot": Uint8Array;
          "nbits": bigint;
          "nonce": bigint;
          "parent": Uint8Array;
          "timestamp": bigint;
          "version": bigint;
        }, bigint>
      >,
      parseTx: {
        "name": "parse-tx",
        "access": "read_only",
        "args": [{ "name": "tx", "type": { "buffer": { "length": 1024 } } }],
        "outputs": {
          "type": {
            "response": {
              "ok": {
                "tuple": [
                  {
                    "name": "ins",
                    "type": {
                      "list": {
                        "type": {
                          "tuple": [{
                            "name": "outpoint",
                            "type": {
                              "tuple": [{
                                "name": "hash",
                                "type": { "buffer": { "length": 32 } },
                              }, { "name": "index", "type": "uint128" }],
                            },
                          }, {
                            "name": "scriptSig",
                            "type": { "buffer": { "length": 256 } },
                          }, { "name": "sequence", "type": "uint128" }],
                        },
                        "length": 8,
                      },
                    },
                  },
                  { "name": "locktime", "type": "uint128" },
                  {
                    "name": "outs",
                    "type": {
                      "list": {
                        "type": {
                          "tuple": [{
                            "name": "scriptPubKey",
                            "type": { "buffer": { "length": 128 } },
                          }, { "name": "value", "type": "uint128" }],
                        },
                        "length": 8,
                      },
                    },
                  },
                  { "name": "version", "type": "uint128" },
                ],
              },
              "error": "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [tx: TypedAbiArg<Uint8Array, "tx">],
        Response<{
          "ins": {
            "outpoint": {
              "hash": Uint8Array;
              "index": bigint;
            };
            "scriptSig": Uint8Array;
            "sequence": bigint;
          }[];
          "locktime": bigint;
          "outs": {
            "scriptPubKey": Uint8Array;
            "value": bigint;
          }[];
          "version": bigint;
        }, bigint>
      >,
      readHashslice: {
        "name": "read-hashslice",
        "access": "read_only",
        "args": [{
          "name": "old-ctx",
          "type": {
            "tuple": [{ "name": "index", "type": "uint128" }, {
              "name": "txbuff",
              "type": { "buffer": { "length": 1024 } },
            }],
          },
        }],
        "outputs": {
          "type": {
            "response": {
              "ok": {
                "tuple": [{
                  "name": "ctx",
                  "type": {
                    "tuple": [{ "name": "index", "type": "uint128" }, {
                      "name": "txbuff",
                      "type": { "buffer": { "length": 1024 } },
                    }],
                  },
                }, {
                  "name": "hashslice",
                  "type": { "buffer": { "length": 32 } },
                }],
              },
              "error": "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          oldCtx: TypedAbiArg<{
            "index": number | bigint;
            "txbuff": Uint8Array;
          }, "oldCtx">,
        ],
        Response<{
          "ctx": {
            "index": bigint;
            "txbuff": Uint8Array;
          };
          "hashslice": Uint8Array;
        }, bigint>
      >,
      readNextTxin: {
        "name": "read-next-txin",
        "access": "read_only",
        "args": [{ "name": "ignored", "type": "bool" }, {
          "name": "state-res",
          "type": {
            "response": {
              "ok": {
                "tuple": [
                  {
                    "name": "ctx",
                    "type": {
                      "tuple": [{ "name": "index", "type": "uint128" }, {
                        "name": "txbuff",
                        "type": { "buffer": { "length": 1024 } },
                      }],
                    },
                  },
                  { "name": "remaining", "type": "uint128" },
                  {
                    "name": "txins",
                    "type": {
                      "list": {
                        "type": {
                          "tuple": [{
                            "name": "outpoint",
                            "type": {
                              "tuple": [{
                                "name": "hash",
                                "type": { "buffer": { "length": 32 } },
                              }, { "name": "index", "type": "uint128" }],
                            },
                          }, {
                            "name": "scriptSig",
                            "type": { "buffer": { "length": 256 } },
                          }, { "name": "sequence", "type": "uint128" }],
                        },
                        "length": 8,
                      },
                    },
                  },
                ],
              },
              "error": "uint128",
            },
          },
        }],
        "outputs": {
          "type": {
            "response": {
              "ok": {
                "tuple": [
                  {
                    "name": "ctx",
                    "type": {
                      "tuple": [{ "name": "index", "type": "uint128" }, {
                        "name": "txbuff",
                        "type": { "buffer": { "length": 1024 } },
                      }],
                    },
                  },
                  { "name": "remaining", "type": "uint128" },
                  {
                    "name": "txins",
                    "type": {
                      "list": {
                        "type": {
                          "tuple": [{
                            "name": "outpoint",
                            "type": {
                              "tuple": [{
                                "name": "hash",
                                "type": { "buffer": { "length": 32 } },
                              }, { "name": "index", "type": "uint128" }],
                            },
                          }, {
                            "name": "scriptSig",
                            "type": { "buffer": { "length": 256 } },
                          }, { "name": "sequence", "type": "uint128" }],
                        },
                        "length": 8,
                      },
                    },
                  },
                ],
              },
              "error": "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          ignored: TypedAbiArg<boolean, "ignored">,
          stateRes: TypedAbiArg<
            Response<{
              "ctx": {
                "index": number | bigint;
                "txbuff": Uint8Array;
              };
              "remaining": number | bigint;
              "txins": {
                "outpoint": {
                  "hash": Uint8Array;
                  "index": number | bigint;
                };
                "scriptSig": Uint8Array;
                "sequence": number | bigint;
              }[];
            }, number | bigint>,
            "stateRes"
          >,
        ],
        Response<{
          "ctx": {
            "index": bigint;
            "txbuff": Uint8Array;
          };
          "remaining": bigint;
          "txins": {
            "outpoint": {
              "hash": Uint8Array;
              "index": bigint;
            };
            "scriptSig": Uint8Array;
            "sequence": bigint;
          }[];
        }, bigint>
      >,
      readNextTxout: {
        "name": "read-next-txout",
        "access": "read_only",
        "args": [{ "name": "ignored", "type": "bool" }, {
          "name": "state-res",
          "type": {
            "response": {
              "ok": {
                "tuple": [
                  {
                    "name": "ctx",
                    "type": {
                      "tuple": [{ "name": "index", "type": "uint128" }, {
                        "name": "txbuff",
                        "type": { "buffer": { "length": 1024 } },
                      }],
                    },
                  },
                  { "name": "remaining", "type": "uint128" },
                  {
                    "name": "txouts",
                    "type": {
                      "list": {
                        "type": {
                          "tuple": [{
                            "name": "scriptPubKey",
                            "type": { "buffer": { "length": 128 } },
                          }, { "name": "value", "type": "uint128" }],
                        },
                        "length": 8,
                      },
                    },
                  },
                ],
              },
              "error": "uint128",
            },
          },
        }],
        "outputs": {
          "type": {
            "response": {
              "ok": {
                "tuple": [
                  {
                    "name": "ctx",
                    "type": {
                      "tuple": [{ "name": "index", "type": "uint128" }, {
                        "name": "txbuff",
                        "type": { "buffer": { "length": 1024 } },
                      }],
                    },
                  },
                  { "name": "remaining", "type": "uint128" },
                  {
                    "name": "txouts",
                    "type": {
                      "list": {
                        "type": {
                          "tuple": [{
                            "name": "scriptPubKey",
                            "type": { "buffer": { "length": 128 } },
                          }, { "name": "value", "type": "uint128" }],
                        },
                        "length": 8,
                      },
                    },
                  },
                ],
              },
              "error": "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          ignored: TypedAbiArg<boolean, "ignored">,
          stateRes: TypedAbiArg<
            Response<{
              "ctx": {
                "index": number | bigint;
                "txbuff": Uint8Array;
              };
              "remaining": number | bigint;
              "txouts": {
                "scriptPubKey": Uint8Array;
                "value": number | bigint;
              }[];
            }, number | bigint>,
            "stateRes"
          >,
        ],
        Response<{
          "ctx": {
            "index": bigint;
            "txbuff": Uint8Array;
          };
          "remaining": bigint;
          "txouts": {
            "scriptPubKey": Uint8Array;
            "value": bigint;
          }[];
        }, bigint>
      >,
      readSlice: {
        "name": "read-slice",
        "access": "read_only",
        "args": [{ "name": "data", "type": { "buffer": { "length": 1024 } } }, {
          "name": "offset",
          "type": "uint128",
        }, { "name": "size", "type": "uint128" }],
        "outputs": {
          "type": {
            "response": {
              "ok": { "buffer": { "length": 1024 } },
              "error": "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          data: TypedAbiArg<Uint8Array, "data">,
          offset: TypedAbiArg<number | bigint, "offset">,
          size: TypedAbiArg<number | bigint, "size">,
        ],
        Response<Uint8Array, bigint>
      >,
      readSlice1: {
        "name": "read-slice-1",
        "access": "read_only",
        "args": [{
          "name": "input",
          "type": {
            "tuple": [{
              "name": "data",
              "type": { "buffer": { "length": 1024 } },
            }, { "name": "index", "type": "uint128" }],
          },
        }],
        "outputs": { "type": { "buffer": { "length": 1024 } } },
      } as TypedAbiFunction<[
        input: TypedAbiArg<{
          "data": Uint8Array;
          "index": number | bigint;
        }, "input">,
      ], Uint8Array>,
      readSlice128: {
        "name": "read-slice-128",
        "access": "read_only",
        "args": [{
          "name": "input",
          "type": {
            "tuple": [{
              "name": "data",
              "type": { "buffer": { "length": 1024 } },
            }, { "name": "index", "type": "uint128" }],
          },
        }],
        "outputs": { "type": { "buffer": { "length": 1024 } } },
      } as TypedAbiFunction<[
        input: TypedAbiArg<{
          "data": Uint8Array;
          "index": number | bigint;
        }, "input">,
      ], Uint8Array>,
      readSlice16: {
        "name": "read-slice-16",
        "access": "read_only",
        "args": [{
          "name": "input",
          "type": {
            "tuple": [{
              "name": "data",
              "type": { "buffer": { "length": 1024 } },
            }, { "name": "index", "type": "uint128" }],
          },
        }],
        "outputs": { "type": { "buffer": { "length": 1024 } } },
      } as TypedAbiFunction<[
        input: TypedAbiArg<{
          "data": Uint8Array;
          "index": number | bigint;
        }, "input">,
      ], Uint8Array>,
      readSlice2: {
        "name": "read-slice-2",
        "access": "read_only",
        "args": [{
          "name": "input",
          "type": {
            "tuple": [{
              "name": "data",
              "type": { "buffer": { "length": 1024 } },
            }, { "name": "index", "type": "uint128" }],
          },
        }],
        "outputs": { "type": { "buffer": { "length": 1024 } } },
      } as TypedAbiFunction<[
        input: TypedAbiArg<{
          "data": Uint8Array;
          "index": number | bigint;
        }, "input">,
      ], Uint8Array>,
      readSlice256: {
        "name": "read-slice-256",
        "access": "read_only",
        "args": [{
          "name": "input",
          "type": {
            "tuple": [{
              "name": "data",
              "type": { "buffer": { "length": 1024 } },
            }, { "name": "index", "type": "uint128" }],
          },
        }],
        "outputs": { "type": { "buffer": { "length": 1024 } } },
      } as TypedAbiFunction<[
        input: TypedAbiArg<{
          "data": Uint8Array;
          "index": number | bigint;
        }, "input">,
      ], Uint8Array>,
      readSlice32: {
        "name": "read-slice-32",
        "access": "read_only",
        "args": [{
          "name": "input",
          "type": {
            "tuple": [{
              "name": "data",
              "type": { "buffer": { "length": 1024 } },
            }, { "name": "index", "type": "uint128" }],
          },
        }],
        "outputs": { "type": { "buffer": { "length": 1024 } } },
      } as TypedAbiFunction<[
        input: TypedAbiArg<{
          "data": Uint8Array;
          "index": number | bigint;
        }, "input">,
      ], Uint8Array>,
      readSlice4: {
        "name": "read-slice-4",
        "access": "read_only",
        "args": [{
          "name": "input",
          "type": {
            "tuple": [{
              "name": "data",
              "type": { "buffer": { "length": 1024 } },
            }, { "name": "index", "type": "uint128" }],
          },
        }],
        "outputs": { "type": { "buffer": { "length": 1024 } } },
      } as TypedAbiFunction<[
        input: TypedAbiArg<{
          "data": Uint8Array;
          "index": number | bigint;
        }, "input">,
      ], Uint8Array>,
      readSlice512: {
        "name": "read-slice-512",
        "access": "read_only",
        "args": [{
          "name": "input",
          "type": {
            "tuple": [{
              "name": "data",
              "type": { "buffer": { "length": 1024 } },
            }, { "name": "index", "type": "uint128" }],
          },
        }],
        "outputs": { "type": { "buffer": { "length": 1024 } } },
      } as TypedAbiFunction<[
        input: TypedAbiArg<{
          "data": Uint8Array;
          "index": number | bigint;
        }, "input">,
      ], Uint8Array>,
      readSlice64: {
        "name": "read-slice-64",
        "access": "read_only",
        "args": [{
          "name": "input",
          "type": {
            "tuple": [{
              "name": "data",
              "type": { "buffer": { "length": 1024 } },
            }, { "name": "index", "type": "uint128" }],
          },
        }],
        "outputs": { "type": { "buffer": { "length": 1024 } } },
      } as TypedAbiFunction<[
        input: TypedAbiArg<{
          "data": Uint8Array;
          "index": number | bigint;
        }, "input">,
      ], Uint8Array>,
      readSlice8: {
        "name": "read-slice-8",
        "access": "read_only",
        "args": [{
          "name": "input",
          "type": {
            "tuple": [{
              "name": "data",
              "type": { "buffer": { "length": 1024 } },
            }, { "name": "index", "type": "uint128" }],
          },
        }],
        "outputs": { "type": { "buffer": { "length": 1024 } } },
      } as TypedAbiFunction<[
        input: TypedAbiArg<{
          "data": Uint8Array;
          "index": number | bigint;
        }, "input">,
      ], Uint8Array>,
      readTxins: {
        "name": "read-txins",
        "access": "read_only",
        "args": [{
          "name": "ctx",
          "type": {
            "tuple": [{ "name": "index", "type": "uint128" }, {
              "name": "txbuff",
              "type": { "buffer": { "length": 1024 } },
            }],
          },
        }],
        "outputs": {
          "type": {
            "response": {
              "ok": {
                "tuple": [
                  {
                    "name": "ctx",
                    "type": {
                      "tuple": [{ "name": "index", "type": "uint128" }, {
                        "name": "txbuff",
                        "type": { "buffer": { "length": 1024 } },
                      }],
                    },
                  },
                  { "name": "remaining", "type": "uint128" },
                  {
                    "name": "txins",
                    "type": {
                      "list": {
                        "type": {
                          "tuple": [{
                            "name": "outpoint",
                            "type": {
                              "tuple": [{
                                "name": "hash",
                                "type": { "buffer": { "length": 32 } },
                              }, { "name": "index", "type": "uint128" }],
                            },
                          }, {
                            "name": "scriptSig",
                            "type": { "buffer": { "length": 256 } },
                          }, { "name": "sequence", "type": "uint128" }],
                        },
                        "length": 8,
                      },
                    },
                  },
                ],
              },
              "error": "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          ctx: TypedAbiArg<{
            "index": number | bigint;
            "txbuff": Uint8Array;
          }, "ctx">,
        ],
        Response<{
          "ctx": {
            "index": bigint;
            "txbuff": Uint8Array;
          };
          "remaining": bigint;
          "txins": {
            "outpoint": {
              "hash": Uint8Array;
              "index": bigint;
            };
            "scriptSig": Uint8Array;
            "sequence": bigint;
          }[];
        }, bigint>
      >,
      readTxouts: {
        "name": "read-txouts",
        "access": "read_only",
        "args": [{
          "name": "ctx",
          "type": {
            "tuple": [{ "name": "index", "type": "uint128" }, {
              "name": "txbuff",
              "type": { "buffer": { "length": 1024 } },
            }],
          },
        }],
        "outputs": {
          "type": {
            "response": {
              "ok": {
                "tuple": [
                  {
                    "name": "ctx",
                    "type": {
                      "tuple": [{ "name": "index", "type": "uint128" }, {
                        "name": "txbuff",
                        "type": { "buffer": { "length": 1024 } },
                      }],
                    },
                  },
                  { "name": "remaining", "type": "uint128" },
                  {
                    "name": "txouts",
                    "type": {
                      "list": {
                        "type": {
                          "tuple": [{
                            "name": "scriptPubKey",
                            "type": { "buffer": { "length": 128 } },
                          }, { "name": "value", "type": "uint128" }],
                        },
                        "length": 8,
                      },
                    },
                  },
                ],
              },
              "error": "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          ctx: TypedAbiArg<{
            "index": number | bigint;
            "txbuff": Uint8Array;
          }, "ctx">,
        ],
        Response<{
          "ctx": {
            "index": bigint;
            "txbuff": Uint8Array;
          };
          "remaining": bigint;
          "txouts": {
            "scriptPubKey": Uint8Array;
            "value": bigint;
          }[];
        }, bigint>
      >,
      readUint16: {
        "name": "read-uint16",
        "access": "read_only",
        "args": [{
          "name": "ctx",
          "type": {
            "tuple": [{ "name": "index", "type": "uint128" }, {
              "name": "txbuff",
              "type": { "buffer": { "length": 1024 } },
            }],
          },
        }],
        "outputs": {
          "type": {
            "response": {
              "ok": {
                "tuple": [{
                  "name": "ctx",
                  "type": {
                    "tuple": [{ "name": "index", "type": "uint128" }, {
                      "name": "txbuff",
                      "type": { "buffer": { "length": 1024 } },
                    }],
                  },
                }, { "name": "uint16", "type": "uint128" }],
              },
              "error": "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          ctx: TypedAbiArg<{
            "index": number | bigint;
            "txbuff": Uint8Array;
          }, "ctx">,
        ],
        Response<{
          "ctx": {
            "index": bigint;
            "txbuff": Uint8Array;
          };
          "uint16": bigint;
        }, bigint>
      >,
      readUint32: {
        "name": "read-uint32",
        "access": "read_only",
        "args": [{
          "name": "ctx",
          "type": {
            "tuple": [{ "name": "index", "type": "uint128" }, {
              "name": "txbuff",
              "type": { "buffer": { "length": 1024 } },
            }],
          },
        }],
        "outputs": {
          "type": {
            "response": {
              "ok": {
                "tuple": [{
                  "name": "ctx",
                  "type": {
                    "tuple": [{ "name": "index", "type": "uint128" }, {
                      "name": "txbuff",
                      "type": { "buffer": { "length": 1024 } },
                    }],
                  },
                }, { "name": "uint32", "type": "uint128" }],
              },
              "error": "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          ctx: TypedAbiArg<{
            "index": number | bigint;
            "txbuff": Uint8Array;
          }, "ctx">,
        ],
        Response<{
          "ctx": {
            "index": bigint;
            "txbuff": Uint8Array;
          };
          "uint32": bigint;
        }, bigint>
      >,
      readUint64: {
        "name": "read-uint64",
        "access": "read_only",
        "args": [{
          "name": "ctx",
          "type": {
            "tuple": [{ "name": "index", "type": "uint128" }, {
              "name": "txbuff",
              "type": { "buffer": { "length": 1024 } },
            }],
          },
        }],
        "outputs": {
          "type": {
            "response": {
              "ok": {
                "tuple": [{
                  "name": "ctx",
                  "type": {
                    "tuple": [{ "name": "index", "type": "uint128" }, {
                      "name": "txbuff",
                      "type": { "buffer": { "length": 1024 } },
                    }],
                  },
                }, { "name": "uint64", "type": "uint128" }],
              },
              "error": "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          ctx: TypedAbiArg<{
            "index": number | bigint;
            "txbuff": Uint8Array;
          }, "ctx">,
        ],
        Response<{
          "ctx": {
            "index": bigint;
            "txbuff": Uint8Array;
          };
          "uint64": bigint;
        }, bigint>
      >,
      readVarint: {
        "name": "read-varint",
        "access": "read_only",
        "args": [{
          "name": "ctx",
          "type": {
            "tuple": [{ "name": "index", "type": "uint128" }, {
              "name": "txbuff",
              "type": { "buffer": { "length": 1024 } },
            }],
          },
        }],
        "outputs": {
          "type": {
            "response": {
              "ok": {
                "tuple": [{
                  "name": "ctx",
                  "type": {
                    "tuple": [{ "name": "index", "type": "uint128" }, {
                      "name": "txbuff",
                      "type": { "buffer": { "length": 1024 } },
                    }],
                  },
                }, { "name": "varint", "type": "uint128" }],
              },
              "error": "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          ctx: TypedAbiArg<{
            "index": number | bigint;
            "txbuff": Uint8Array;
          }, "ctx">,
        ],
        Response<{
          "ctx": {
            "index": bigint;
            "txbuff": Uint8Array;
          };
          "varint": bigint;
        }, bigint>
      >,
      readVarslice: {
        "name": "read-varslice",
        "access": "read_only",
        "args": [{
          "name": "old-ctx",
          "type": {
            "tuple": [{ "name": "index", "type": "uint128" }, {
              "name": "txbuff",
              "type": { "buffer": { "length": 1024 } },
            }],
          },
        }],
        "outputs": {
          "type": {
            "response": {
              "ok": {
                "tuple": [{
                  "name": "ctx",
                  "type": {
                    "tuple": [{ "name": "index", "type": "uint128" }, {
                      "name": "txbuff",
                      "type": { "buffer": { "length": 1024 } },
                    }],
                  },
                }, {
                  "name": "varslice",
                  "type": { "buffer": { "length": 1024 } },
                }],
              },
              "error": "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          oldCtx: TypedAbiArg<{
            "index": number | bigint;
            "txbuff": Uint8Array;
          }, "oldCtx">,
        ],
        Response<{
          "ctx": {
            "index": bigint;
            "txbuff": Uint8Array;
          };
          "varslice": Uint8Array;
        }, bigint>
      >,
      reverseBuff32: {
        "name": "reverse-buff32",
        "access": "read_only",
        "args": [{ "name": "input", "type": { "buffer": { "length": 32 } } }],
        "outputs": { "type": { "buffer": { "length": 32 } } },
      } as TypedAbiFunction<
        [input: TypedAbiArg<Uint8Array, "input">],
        Uint8Array
      >,
      verifyBlockHeader: {
        "name": "verify-block-header",
        "access": "read_only",
        "args": [{
          "name": "headerbuff",
          "type": { "buffer": { "length": 80 } },
        }, { "name": "expected-block-height", "type": "uint128" }],
        "outputs": { "type": "bool" },
      } as TypedAbiFunction<
        [
          headerbuff: TypedAbiArg<Uint8Array, "headerbuff">,
          expectedBlockHeight: TypedAbiArg<
            number | bigint,
            "expectedBlockHeight"
          >,
        ],
        boolean
      >,
      verifyMerkleProof: {
        "name": "verify-merkle-proof",
        "access": "read_only",
        "args": [
          { "name": "reversed-txid", "type": { "buffer": { "length": 32 } } },
          { "name": "merkle-root", "type": { "buffer": { "length": 32 } } },
          {
            "name": "proof",
            "type": {
              "tuple": [
                {
                  "name": "hashes",
                  "type": {
                    "list": {
                      "type": { "buffer": { "length": 32 } },
                      "length": 12,
                    },
                  },
                },
                { "name": "tree-depth", "type": "uint128" },
                { "name": "tx-index", "type": "uint128" },
              ],
            },
          },
        ],
        "outputs": {
          "type": { "response": { "ok": "bool", "error": "uint128" } },
        },
      } as TypedAbiFunction<
        [
          reversedTxid: TypedAbiArg<Uint8Array, "reversedTxid">,
          merkleRoot: TypedAbiArg<Uint8Array, "merkleRoot">,
          proof: TypedAbiArg<{
            "hashes": Uint8Array[];
            "treeDepth": number | bigint;
            "txIndex": number | bigint;
          }, "proof">,
        ],
        Response<boolean, bigint>
      >,
      verifyPrevBlock: {
        "name": "verify-prev-block",
        "access": "read_only",
        "args": [{ "name": "block", "type": { "buffer": { "length": 80 } } }, {
          "name": "parent",
          "type": { "buffer": { "length": 80 } },
        }],
        "outputs": {
          "type": { "response": { "ok": "bool", "error": "uint128" } },
        },
      } as TypedAbiFunction<
        [
          block: TypedAbiArg<Uint8Array, "block">,
          parent: TypedAbiArg<Uint8Array, "parent">,
        ],
        Response<boolean, bigint>
      >,
      verifyPrevBlocks: {
        "name": "verify-prev-blocks",
        "access": "read_only",
        "args": [{ "name": "block", "type": { "buffer": { "length": 80 } } }, {
          "name": "prev-blocks",
          "type": {
            "list": { "type": { "buffer": { "length": 80 } }, "length": 10 },
          },
        }],
        "outputs": {
          "type": {
            "response": {
              "ok": { "buffer": { "length": 80 } },
              "error": "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          block: TypedAbiArg<Uint8Array, "block">,
          prevBlocks: TypedAbiArg<Uint8Array[], "prevBlocks">,
        ],
        Response<Uint8Array, bigint>
      >,
      verifyPrevBlocksFold: {
        "name": "verify-prev-blocks-fold",
        "access": "read_only",
        "args": [{ "name": "parent", "type": { "buffer": { "length": 80 } } }, {
          "name": "next-resp",
          "type": {
            "response": {
              "ok": { "buffer": { "length": 80 } },
              "error": "uint128",
            },
          },
        }],
        "outputs": {
          "type": {
            "response": {
              "ok": { "buffer": { "length": 80 } },
              "error": "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          parent: TypedAbiArg<Uint8Array, "parent">,
          nextResp: TypedAbiArg<
            Response<Uint8Array, number | bigint>,
            "nextResp"
          >,
        ],
        Response<Uint8Array, bigint>
      >,
      wasTxMinedPrev: {
        "name": "was-tx-mined-prev?",
        "access": "read_only",
        "args": [
          {
            "name": "block",
            "type": {
              "tuple": [{
                "name": "header",
                "type": { "buffer": { "length": 80 } },
              }, { "name": "height", "type": "uint128" }],
            },
          },
          {
            "name": "prev-blocks",
            "type": {
              "list": { "type": { "buffer": { "length": 80 } }, "length": 10 },
            },
          },
          { "name": "tx", "type": { "buffer": { "length": 1024 } } },
          {
            "name": "proof",
            "type": {
              "tuple": [
                {
                  "name": "hashes",
                  "type": {
                    "list": {
                      "type": { "buffer": { "length": 32 } },
                      "length": 12,
                    },
                  },
                },
                { "name": "tree-depth", "type": "uint128" },
                { "name": "tx-index", "type": "uint128" },
              ],
            },
          },
        ],
        "outputs": {
          "type": { "response": { "ok": "bool", "error": "uint128" } },
        },
      } as TypedAbiFunction<[
        block: TypedAbiArg<{
          "header": Uint8Array;
          "height": number | bigint;
        }, "block">,
        prevBlocks: TypedAbiArg<Uint8Array[], "prevBlocks">,
        tx: TypedAbiArg<Uint8Array, "tx">,
        proof: TypedAbiArg<{
          "hashes": Uint8Array[];
          "treeDepth": number | bigint;
          "txIndex": number | bigint;
        }, "proof">,
      ], Response<boolean, bigint>>,
      wasTxMined: {
        "name": "was-tx-mined?",
        "access": "read_only",
        "args": [
          {
            "name": "block",
            "type": {
              "tuple": [{
                "name": "header",
                "type": { "buffer": { "length": 80 } },
              }, { "name": "height", "type": "uint128" }],
            },
          },
          { "name": "tx", "type": { "buffer": { "length": 1024 } } },
          {
            "name": "proof",
            "type": {
              "tuple": [
                {
                  "name": "hashes",
                  "type": {
                    "list": {
                      "type": { "buffer": { "length": 32 } },
                      "length": 12,
                    },
                  },
                },
                { "name": "tree-depth", "type": "uint128" },
                { "name": "tx-index", "type": "uint128" },
              ],
            },
          },
        ],
        "outputs": {
          "type": { "response": { "ok": "bool", "error": "uint128" } },
        },
      } as TypedAbiFunction<[
        block: TypedAbiArg<{
          "header": Uint8Array;
          "height": number | bigint;
        }, "block">,
        tx: TypedAbiArg<Uint8Array, "tx">,
        proof: TypedAbiArg<{
          "hashes": Uint8Array[];
          "treeDepth": number | bigint;
          "txIndex": number | bigint;
        }, "proof">,
      ], Response<boolean, bigint>>,
    },
    "maps": {},
    "variables": {
      BUFF_TO_BYTE: {
        name: "BUFF_TO_BYTE",
        type: {
          list: {
            type: {
              buffer: {
                length: 1,
              },
            },
            length: 256,
          },
        },
        access: "constant",
      } as TypedAbiVariable<Uint8Array[]>,
      ERR_BAD_HEADER: {
        name: "ERR-BAD-HEADER",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_INVALID_PARENT: {
        name: "ERR-INVALID-PARENT",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_OUT_OF_BOUNDS: {
        name: "ERR-OUT-OF-BOUNDS",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_PROOF_TOO_SHORT: {
        name: "ERR-PROOF-TOO-SHORT",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_TOO_MANY_TXINS: {
        name: "ERR-TOO-MANY-TXINS",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_TOO_MANY_TXOUTS: {
        name: "ERR-TOO-MANY-TXOUTS",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      ERR_VARSLICE_TOO_LONG: {
        name: "ERR-VARSLICE-TOO-LONG",
        type: "uint128",
        access: "constant",
      } as TypedAbiVariable<bigint>,
      lIST_128: {
        name: "LIST_128",
        type: {
          list: {
            type: "bool",
            length: 128,
          },
        },
        access: "constant",
      } as TypedAbiVariable<boolean[]>,
      lIST_16: {
        name: "LIST_16",
        type: {
          list: {
            type: "bool",
            length: 16,
          },
        },
        access: "constant",
      } as TypedAbiVariable<boolean[]>,
      lIST_256: {
        name: "LIST_256",
        type: {
          list: {
            type: "bool",
            length: 256,
          },
        },
        access: "constant",
      } as TypedAbiVariable<boolean[]>,
      lIST_32: {
        name: "LIST_32",
        type: {
          list: {
            type: "bool",
            length: 32,
          },
        },
        access: "constant",
      } as TypedAbiVariable<boolean[]>,
      lIST_512: {
        name: "LIST_512",
        type: {
          list: {
            type: "bool",
            length: 512,
          },
        },
        access: "constant",
      } as TypedAbiVariable<boolean[]>,
      lIST_64: {
        name: "LIST_64",
        type: {
          list: {
            type: "bool",
            length: 64,
          },
        },
        access: "constant",
      } as TypedAbiVariable<boolean[]>,
    },
    constants: {
      BUFF_TO_BYTE: [
        Uint8Array.from([0]),
        Uint8Array.from([1]),
        Uint8Array.from([2]),
        Uint8Array.from([3]),
        Uint8Array.from([4]),
        Uint8Array.from([5]),
        Uint8Array.from([6]),
        Uint8Array.from([7]),
        Uint8Array.from([8]),
        Uint8Array.from([9]),
        Uint8Array.from([10]),
        Uint8Array.from([11]),
        Uint8Array.from([12]),
        Uint8Array.from([13]),
        Uint8Array.from([14]),
        Uint8Array.from([15]),
        Uint8Array.from([16]),
        Uint8Array.from([17]),
        Uint8Array.from([18]),
        Uint8Array.from([19]),
        Uint8Array.from([20]),
        Uint8Array.from([21]),
        Uint8Array.from([22]),
        Uint8Array.from([23]),
        Uint8Array.from([24]),
        Uint8Array.from([25]),
        Uint8Array.from([26]),
        Uint8Array.from([27]),
        Uint8Array.from([28]),
        Uint8Array.from([29]),
        Uint8Array.from([30]),
        Uint8Array.from([31]),
        Uint8Array.from([32]),
        Uint8Array.from([33]),
        Uint8Array.from([34]),
        Uint8Array.from([35]),
        Uint8Array.from([36]),
        Uint8Array.from([37]),
        Uint8Array.from([38]),
        Uint8Array.from([39]),
        Uint8Array.from([40]),
        Uint8Array.from([41]),
        Uint8Array.from([42]),
        Uint8Array.from([43]),
        Uint8Array.from([44]),
        Uint8Array.from([45]),
        Uint8Array.from([46]),
        Uint8Array.from([47]),
        Uint8Array.from([48]),
        Uint8Array.from([49]),
        Uint8Array.from([50]),
        Uint8Array.from([51]),
        Uint8Array.from([52]),
        Uint8Array.from([53]),
        Uint8Array.from([54]),
        Uint8Array.from([55]),
        Uint8Array.from([56]),
        Uint8Array.from([57]),
        Uint8Array.from([58]),
        Uint8Array.from([59]),
        Uint8Array.from([60]),
        Uint8Array.from([61]),
        Uint8Array.from([62]),
        Uint8Array.from([63]),
        Uint8Array.from([64]),
        Uint8Array.from([65]),
        Uint8Array.from([66]),
        Uint8Array.from([67]),
        Uint8Array.from([68]),
        Uint8Array.from([69]),
        Uint8Array.from([70]),
        Uint8Array.from([71]),
        Uint8Array.from([72]),
        Uint8Array.from([73]),
        Uint8Array.from([74]),
        Uint8Array.from([75]),
        Uint8Array.from([76]),
        Uint8Array.from([77]),
        Uint8Array.from([78]),
        Uint8Array.from([79]),
        Uint8Array.from([80]),
        Uint8Array.from([81]),
        Uint8Array.from([82]),
        Uint8Array.from([83]),
        Uint8Array.from([84]),
        Uint8Array.from([85]),
        Uint8Array.from([86]),
        Uint8Array.from([87]),
        Uint8Array.from([88]),
        Uint8Array.from([89]),
        Uint8Array.from([90]),
        Uint8Array.from([91]),
        Uint8Array.from([92]),
        Uint8Array.from([93]),
        Uint8Array.from([94]),
        Uint8Array.from([95]),
        Uint8Array.from([96]),
        Uint8Array.from([97]),
        Uint8Array.from([98]),
        Uint8Array.from([99]),
        Uint8Array.from([100]),
        Uint8Array.from([101]),
        Uint8Array.from([102]),
        Uint8Array.from([103]),
        Uint8Array.from([104]),
        Uint8Array.from([105]),
        Uint8Array.from([106]),
        Uint8Array.from([107]),
        Uint8Array.from([108]),
        Uint8Array.from([109]),
        Uint8Array.from([110]),
        Uint8Array.from([111]),
        Uint8Array.from([112]),
        Uint8Array.from([113]),
        Uint8Array.from([114]),
        Uint8Array.from([115]),
        Uint8Array.from([116]),
        Uint8Array.from([117]),
        Uint8Array.from([118]),
        Uint8Array.from([119]),
        Uint8Array.from([120]),
        Uint8Array.from([121]),
        Uint8Array.from([122]),
        Uint8Array.from([123]),
        Uint8Array.from([124]),
        Uint8Array.from([125]),
        Uint8Array.from([126]),
        Uint8Array.from([127]),
        Uint8Array.from([128]),
        Uint8Array.from([129]),
        Uint8Array.from([130]),
        Uint8Array.from([131]),
        Uint8Array.from([132]),
        Uint8Array.from([133]),
        Uint8Array.from([134]),
        Uint8Array.from([135]),
        Uint8Array.from([136]),
        Uint8Array.from([137]),
        Uint8Array.from([138]),
        Uint8Array.from([139]),
        Uint8Array.from([140]),
        Uint8Array.from([141]),
        Uint8Array.from([142]),
        Uint8Array.from([143]),
        Uint8Array.from([144]),
        Uint8Array.from([145]),
        Uint8Array.from([146]),
        Uint8Array.from([147]),
        Uint8Array.from([148]),
        Uint8Array.from([149]),
        Uint8Array.from([150]),
        Uint8Array.from([151]),
        Uint8Array.from([152]),
        Uint8Array.from([153]),
        Uint8Array.from([154]),
        Uint8Array.from([155]),
        Uint8Array.from([156]),
        Uint8Array.from([157]),
        Uint8Array.from([158]),
        Uint8Array.from([159]),
        Uint8Array.from([160]),
        Uint8Array.from([161]),
        Uint8Array.from([162]),
        Uint8Array.from([163]),
        Uint8Array.from([164]),
        Uint8Array.from([165]),
        Uint8Array.from([166]),
        Uint8Array.from([167]),
        Uint8Array.from([168]),
        Uint8Array.from([169]),
        Uint8Array.from([170]),
        Uint8Array.from([171]),
        Uint8Array.from([172]),
        Uint8Array.from([173]),
        Uint8Array.from([174]),
        Uint8Array.from([175]),
        Uint8Array.from([176]),
        Uint8Array.from([177]),
        Uint8Array.from([178]),
        Uint8Array.from([179]),
        Uint8Array.from([180]),
        Uint8Array.from([181]),
        Uint8Array.from([182]),
        Uint8Array.from([183]),
        Uint8Array.from([184]),
        Uint8Array.from([185]),
        Uint8Array.from([186]),
        Uint8Array.from([187]),
        Uint8Array.from([188]),
        Uint8Array.from([189]),
        Uint8Array.from([190]),
        Uint8Array.from([191]),
        Uint8Array.from([192]),
        Uint8Array.from([193]),
        Uint8Array.from([194]),
        Uint8Array.from([195]),
        Uint8Array.from([196]),
        Uint8Array.from([197]),
        Uint8Array.from([198]),
        Uint8Array.from([199]),
        Uint8Array.from([200]),
        Uint8Array.from([201]),
        Uint8Array.from([202]),
        Uint8Array.from([203]),
        Uint8Array.from([204]),
        Uint8Array.from([205]),
        Uint8Array.from([206]),
        Uint8Array.from([207]),
        Uint8Array.from([208]),
        Uint8Array.from([209]),
        Uint8Array.from([210]),
        Uint8Array.from([211]),
        Uint8Array.from([212]),
        Uint8Array.from([213]),
        Uint8Array.from([214]),
        Uint8Array.from([215]),
        Uint8Array.from([216]),
        Uint8Array.from([217]),
        Uint8Array.from([218]),
        Uint8Array.from([219]),
        Uint8Array.from([220]),
        Uint8Array.from([221]),
        Uint8Array.from([222]),
        Uint8Array.from([223]),
        Uint8Array.from([224]),
        Uint8Array.from([225]),
        Uint8Array.from([226]),
        Uint8Array.from([227]),
        Uint8Array.from([228]),
        Uint8Array.from([229]),
        Uint8Array.from([230]),
        Uint8Array.from([231]),
        Uint8Array.from([232]),
        Uint8Array.from([233]),
        Uint8Array.from([234]),
        Uint8Array.from([235]),
        Uint8Array.from([236]),
        Uint8Array.from([237]),
        Uint8Array.from([238]),
        Uint8Array.from([239]),
        Uint8Array.from([240]),
        Uint8Array.from([241]),
        Uint8Array.from([242]),
        Uint8Array.from([243]),
        Uint8Array.from([244]),
        Uint8Array.from([245]),
        Uint8Array.from([246]),
        Uint8Array.from([247]),
        Uint8Array.from([248]),
        Uint8Array.from([249]),
        Uint8Array.from([250]),
        Uint8Array.from([251]),
        Uint8Array.from([252]),
        Uint8Array.from([253]),
        Uint8Array.from([254]),
        Uint8Array.from([255]),
      ],
      eRRBADHEADER: 5n,
      eRRINVALIDPARENT: 7n,
      eRROUTOFBOUNDS: 1n,
      eRRPROOFTOOSHORT: 6n,
      eRRTOOMANYTXINS: 2n,
      eRRTOOMANYTXOUTS: 3n,
      eRRVARSLICETOOLONG: 4n,
      lIST_128: [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ],
      lIST_16: [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ],
      lIST_256: [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ],
      lIST_32: [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ],
      lIST_512: [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ],
      lIST_64: [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ],
    },
    "non_fungible_tokens": [],
    "fungible_tokens": [],
    "clarity_version": "Clarity1",
    contractName: "clarity-bitcoin",
  },
  ordy: {
    "functions": {
      makeNextId: {
        "name": "make-next-id",
        "access": "private",
        "args": [],
        "outputs": { "type": "uint128" },
      } as TypedAbiFunction<[], bigint>,
      cancelOffer: {
        "name": "cancel-offer",
        "access": "public",
        "args": [{ "name": "id", "type": "uint128" }],
        "outputs": {
          "type": { "response": { "ok": "bool", "error": "uint128" } },
        },
      } as TypedAbiFunction<
        [id: TypedAbiArg<number | bigint, "id">],
        Response<boolean, bigint>
      >,
      createOffer: {
        "name": "create-offer",
        "access": "public",
        "args": [
          { "name": "txid", "type": { "buffer": { "length": 32 } } },
          { "name": "index", "type": "uint128" },
          { "name": "amount", "type": "uint128" },
          { "name": "output", "type": { "buffer": { "length": 128 } } },
          { "name": "recipient", "type": "principal" },
        ],
        "outputs": {
          "type": { "response": { "ok": "bool", "error": "uint128" } },
        },
      } as TypedAbiFunction<
        [
          txid: TypedAbiArg<Uint8Array, "txid">,
          index: TypedAbiArg<number | bigint, "index">,
          amount: TypedAbiArg<number | bigint, "amount">,
          output: TypedAbiArg<Uint8Array, "output">,
          recipient: TypedAbiArg<string, "recipient">,
        ],
        Response<boolean, bigint>
      >,
      finalizeOffer: {
        "name": "finalize-offer",
        "access": "public",
        "args": [
          {
            "name": "block",
            "type": {
              "tuple": [{
                "name": "header",
                "type": { "buffer": { "length": 80 } },
              }, { "name": "height", "type": "uint128" }],
            },
          },
          {
            "name": "prev-blocks",
            "type": {
              "list": { "type": { "buffer": { "length": 80 } }, "length": 10 },
            },
          },
          { "name": "tx", "type": { "buffer": { "length": 1024 } } },
          {
            "name": "proof",
            "type": {
              "tuple": [
                {
                  "name": "hashes",
                  "type": {
                    "list": {
                      "type": { "buffer": { "length": 32 } },
                      "length": 12,
                    },
                  },
                },
                { "name": "tree-depth", "type": "uint128" },
                { "name": "tx-index", "type": "uint128" },
              ],
            },
          },
          { "name": "output-index", "type": "uint128" },
          { "name": "input-index", "type": "uint128" },
          { "name": "offer-id", "type": "uint128" },
        ],
        "outputs": {
          "type": { "response": { "ok": "bool", "error": "uint128" } },
        },
      } as TypedAbiFunction<[
        block: TypedAbiArg<{
          "header": Uint8Array;
          "height": number | bigint;
        }, "block">,
        prevBlocks: TypedAbiArg<Uint8Array[], "prevBlocks">,
        tx: TypedAbiArg<Uint8Array, "tx">,
        proof: TypedAbiArg<{
          "hashes": Uint8Array[];
          "treeDepth": number | bigint;
          "txIndex": number | bigint;
        }, "proof">,
        outputIndex: TypedAbiArg<number | bigint, "outputIndex">,
        inputIndex: TypedAbiArg<number | bigint, "inputIndex">,
        offerId: TypedAbiArg<number | bigint, "offerId">,
      ], Response<boolean, bigint>>,
      refundCancelledOffer: {
        "name": "refund-cancelled-offer",
        "access": "public",
        "args": [{ "name": "id", "type": "uint128" }],
        "outputs": {
          "type": { "response": { "ok": "bool", "error": "uint128" } },
        },
      } as TypedAbiFunction<
        [id: TypedAbiArg<number | bigint, "id">],
        Response<boolean, bigint>
      >,
      getOffer: {
        "name": "get-offer",
        "access": "read_only",
        "args": [{ "name": "id", "type": "uint128" }],
        "outputs": {
          "type": {
            "optional": {
              "tuple": [
                { "name": "amount", "type": "uint128" },
                { "name": "index", "type": "uint128" },
                { "name": "output", "type": { "buffer": { "length": 128 } } },
                { "name": "recipient", "type": "principal" },
                { "name": "sender", "type": "principal" },
                { "name": "txid", "type": { "buffer": { "length": 32 } } },
              ],
            },
          },
        },
      } as TypedAbiFunction<
        [id: TypedAbiArg<number | bigint, "id">],
        {
          "amount": bigint;
          "index": bigint;
          "output": Uint8Array;
          "recipient": string;
          "sender": string;
          "txid": Uint8Array;
        } | null
      >,
      getOfferAccepted: {
        "name": "get-offer-accepted",
        "access": "read_only",
        "args": [{ "name": "id", "type": "uint128" }],
        "outputs": { "type": { "optional": "bool" } },
      } as TypedAbiFunction<
        [id: TypedAbiArg<number | bigint, "id">],
        boolean | null
      >,
      getOfferCancelled: {
        "name": "get-offer-cancelled",
        "access": "read_only",
        "args": [{ "name": "id", "type": "uint128" }],
        "outputs": { "type": { "optional": "uint128" } },
      } as TypedAbiFunction<
        [id: TypedAbiArg<number | bigint, "id">],
        bigint | null
      >,
      getOfferRefunded: {
        "name": "get-offer-refunded",
        "access": "read_only",
        "args": [{ "name": "id", "type": "uint128" }],
        "outputs": { "type": { "optional": "uint128" } },
      } as TypedAbiFunction<
        [id: TypedAbiArg<number | bigint, "id">],
        bigint | null
      >,
      validateOfferTransfer: {
        "name": "validate-offer-transfer",
        "access": "read_only",
        "args": [
          {
            "name": "block",
            "type": {
              "tuple": [{
                "name": "header",
                "type": { "buffer": { "length": 80 } },
              }, { "name": "height", "type": "uint128" }],
            },
          },
          {
            "name": "prev-blocks",
            "type": {
              "list": { "type": { "buffer": { "length": 80 } }, "length": 10 },
            },
          },
          { "name": "tx", "type": { "buffer": { "length": 1024 } } },
          {
            "name": "proof",
            "type": {
              "tuple": [
                {
                  "name": "hashes",
                  "type": {
                    "list": {
                      "type": { "buffer": { "length": 32 } },
                      "length": 12,
                    },
                  },
                },
                { "name": "tree-depth", "type": "uint128" },
                { "name": "tx-index", "type": "uint128" },
              ],
            },
          },
          { "name": "input-index", "type": "uint128" },
          { "name": "output-index", "type": "uint128" },
          { "name": "offer-id", "type": "uint128" },
        ],
        "outputs": {
          "type": {
            "response": {
              "ok": {
                "tuple": [
                  { "name": "amount", "type": "uint128" },
                  { "name": "index", "type": "uint128" },
                  { "name": "output", "type": { "buffer": { "length": 128 } } },
                  { "name": "recipient", "type": "principal" },
                  { "name": "sender", "type": "principal" },
                  { "name": "txid", "type": { "buffer": { "length": 32 } } },
                ],
              },
              "error": "uint128",
            },
          },
        },
      } as TypedAbiFunction<
        [
          block: TypedAbiArg<{
            "header": Uint8Array;
            "height": number | bigint;
          }, "block">,
          prevBlocks: TypedAbiArg<Uint8Array[], "prevBlocks">,
          tx: TypedAbiArg<Uint8Array, "tx">,
          proof: TypedAbiArg<{
            "hashes": Uint8Array[];
            "treeDepth": number | bigint;
            "txIndex": number | bigint;
          }, "proof">,
          inputIndex: TypedAbiArg<number | bigint, "inputIndex">,
          outputIndex: TypedAbiArg<number | bigint, "outputIndex">,
          offerId: TypedAbiArg<number | bigint, "offerId">,
        ],
        Response<{
          "amount": bigint;
          "index": bigint;
          "output": Uint8Array;
          "recipient": string;
          "sender": string;
          "txid": Uint8Array;
        }, bigint>
      >,
    },
    "maps": {
      offersAcceptedMap: {
        "name": "offers-accepted-map",
        "key": "uint128",
        "value": "bool",
      } as TypedAbiMap<number | bigint, boolean>,
      offersCancelledMap: {
        "name": "offers-cancelled-map",
        "key": "uint128",
        "value": "uint128",
      } as TypedAbiMap<number | bigint, bigint>,
      offersMap: {
        "name": "offers-map",
        "key": "uint128",
        "value": {
          "tuple": [
            { "name": "amount", "type": "uint128" },
            { "name": "index", "type": "uint128" },
            { "name": "output", "type": { "buffer": { "length": 128 } } },
            { "name": "recipient", "type": "principal" },
            { "name": "sender", "type": "principal" },
            { "name": "txid", "type": { "buffer": { "length": 32 } } },
          ],
        },
      } as TypedAbiMap<number | bigint, {
        "amount": bigint;
        "index": bigint;
        "output": Uint8Array;
        "recipient": string;
        "sender": string;
        "txid": Uint8Array;
      }>,
      offersRefundedMap: {
        "name": "offers-refunded-map",
        "key": "uint128",
        "value": "bool",
      } as TypedAbiMap<number | bigint, boolean>,
    },
    "variables": {
      ERR_INVALID_OFFER: {
        name: "ERR_INVALID_OFFER",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_INVALID_TX: {
        name: "ERR_INVALID_TX",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_OFFER_ACCEPTED: {
        name: "ERR_OFFER_ACCEPTED",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_OFFER_CANCELLED: {
        name: "ERR_OFFER_CANCELLED",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_OFFER_MISMATCH: {
        name: "ERR_OFFER_MISMATCH",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      ERR_TX_NOT_MINED: {
        name: "ERR_TX_NOT_MINED",
        type: {
          response: {
            ok: "none",
            error: "uint128",
          },
        },
        access: "constant",
      } as TypedAbiVariable<Response<null, bigint>>,
      lastIdVar: {
        name: "last-id-var",
        type: "uint128",
        access: "variable",
      } as TypedAbiVariable<bigint>,
    },
    constants: {
      ERR_INVALID_OFFER: {
        isOk: false,
        value: 102n,
      },
      ERR_INVALID_TX: {
        isOk: false,
        value: 101n,
      },
      ERR_OFFER_ACCEPTED: {
        isOk: false,
        value: 104n,
      },
      ERR_OFFER_CANCELLED: {
        isOk: false,
        value: 105n,
      },
      ERR_OFFER_MISMATCH: {
        isOk: false,
        value: 103n,
      },
      ERR_TX_NOT_MINED: {
        isOk: false,
        value: 100n,
      },
      lastIdVar: 0n,
    },
    "non_fungible_tokens": [],
    "fungible_tokens": [],
    "clarity_version": "Clarity1",
    contractName: "ordy",
  },
} as const;

export const accounts = {
  "deployer": {
    "address": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "balance": 100000000000000,
  },
  "faucet": {
    "address": "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6",
    "balance": 100000000000000,
  },
  "wallet_1": {
    "address": "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5",
    "balance": 100000000000000,
  },
  "wallet_2": {
    "address": "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
    "balance": 100000000000000,
  },
  "wallet_3": {
    "address": "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC",
    "balance": 100000000000000,
  },
  "wallet_4": {
    "address": "ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND",
    "balance": 100000000000000,
  },
  "wallet_5": {
    "address": "ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB",
    "balance": 100000000000000,
  },
  "wallet_6": {
    "address": "ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0",
    "balance": 100000000000000,
  },
  "wallet_7": {
    "address": "ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ",
    "balance": 100000000000000,
  },
  "wallet_8": {
    "address": "ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP",
    "balance": 100000000000000,
  },
} as const;

export const simnet = {
  accounts,
  contracts,
} as const;
