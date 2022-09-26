"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
exports.__esModule = true;
exports.NounsDaoLogicV1Factory = exports.NounsSeederFactory = exports.NounsDescriptorFactory = exports.NounsAuctionHouseFactory = exports.NounsTokenFactory = exports.NounsDAOABI = exports.NounsSeederABI = exports.NounsDescriptorABI = exports.NounsAuctionHouseABI = exports.NounsTokenABI = void 0;
var NounsToken_json_1 = require("../abi/contracts/NounsToken.sol/NounsToken.json");
__createBinding(exports, NounsToken_json_1, "default", "NounsTokenABI");
var NounsAuctionHouse_json_1 = require("../abi/contracts/NounsAuctionHouse.sol/NounsAuctionHouse.json");
__createBinding(exports, NounsAuctionHouse_json_1, "default", "NounsAuctionHouseABI");
var NounsDescriptor_json_1 = require("../abi/contracts/NounsDescriptor.sol/NounsDescriptor.json");
__createBinding(exports, NounsDescriptor_json_1, "default", "NounsDescriptorABI");
var NounsSeeder_json_1 = require("../abi/contracts/NounsSeeder.sol/NounsSeeder.json");
__createBinding(exports, NounsSeeder_json_1, "default", "NounsSeederABI");
var NounsDAOLogicV1_json_1 = require("../abi/contracts/governance/NounsDAOLogicV1.sol/NounsDAOLogicV1.json");
__createBinding(exports, NounsDAOLogicV1_json_1, "default", "NounsDAOABI");
var NounsToken__factory_1 = require("../typechain/factories/contracts/NounsToken__factory");
__createBinding(exports, NounsToken__factory_1, "NounsToken__factory", "NounsTokenFactory");
var NounsAuctionHouse__factory_1 = require("../typechain/factories/contracts/NounsAuctionHouse__factory");
__createBinding(exports, NounsAuctionHouse__factory_1, "NounsAuctionHouse__factory", "NounsAuctionHouseFactory");
var NounsDescriptor__factory_1 = require("../typechain/factories/contracts/NounsDescriptor__factory");
__createBinding(exports, NounsDescriptor__factory_1, "NounsDescriptor__factory", "NounsDescriptorFactory");
var NounsSeeder__factory_1 = require("../typechain/factories/contracts/NounsSeeder__factory");
__createBinding(exports, NounsSeeder__factory_1, "NounsSeeder__factory", "NounsSeederFactory");
var NounsDAOLogicV1__factory_1 = require("../typechain/factories/contracts/governance/NounsDAOLogicV1__factory");
__createBinding(exports, NounsDAOLogicV1__factory_1, "NounsDAOLogicV1__factory", "NounsDaoLogicV1Factory");
