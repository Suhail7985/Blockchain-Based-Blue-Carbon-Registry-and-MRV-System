// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VerificationRegistry {
    address public nccr;
    mapping(address => bool) public panchayat;
    mapping(uint256 => bool) public plantationVerifiedByPanchayat;
    mapping(uint256 => bool) public plantationVerifiedByNCCR;

    event PanchayatAdded(address indexed panchayat);
    event PanchayatRemoved(address indexed panchayat);
    event PanchayatVerified(uint256 indexed plantationId, address indexed panchayat);
    event NCCRVerified(uint256 indexed plantationId, address indexed nccr);

    modifier onlyNCCR() {
        require(msg.sender == nccr, "Not NCCR");
        _;
    }

    modifier onlyPanchayat() {
        require(panchayat[msg.sender], "Not Panchayat");
        _;
    }

    constructor(address _nccr) {
        nccr = _nccr;
    }

    function addPanchayat(address _panchayat) external onlyNCCR {
        panchayat[_panchayat] = true;
        emit PanchayatAdded(_panchayat);
    }

    function removePanchayat(address _panchayat) external onlyNCCR {
        panchayat[_panchayat] = false;
        emit PanchayatRemoved(_panchayat);
    }

    function verifyByPanchayat(uint256 plantationId) external onlyPanchayat {
        plantationVerifiedByPanchayat[plantationId] = true;
        emit PanchayatVerified(plantationId, msg.sender);
    }

    function verifyByNCCR(uint256 plantationId) external onlyNCCR {
        require(plantationVerifiedByPanchayat[plantationId], "Not yet verified by Panchayat");
        plantationVerifiedByNCCR[plantationId] = true;
        emit NCCRVerified(plantationId, msg.sender);
    }
}
