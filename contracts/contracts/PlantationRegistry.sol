// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PlantationRegistry
 * @dev Registry for blue carbon restoration plantations with immutable on-chain data storage
 */

interface ICarbonCreditToken {
    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
}

contract PlantationRegistry {
    
    struct Plantation {
        uint256 id;
        address owner;
        string location;
        uint256 area; // in hectares (with 18 decimals)
        uint256 plantedDate;
        uint256 treeCount;
        uint256 mangrovePercentage;
        string plantationDataHash; // IPFS or centralized storage hash
        uint256 carbonSequestered; // in tons (with 18 decimals)
        bool verified;
        uint256 verificationDate;
        address verifier;
        string verificationNote;
        uint256 tokensIssued;
        uint256 createdAt;
        uint256 updatedAt;
    }

    ICarbonCreditToken public carbonToken;
    address public owner;
    address public admin;
    
    uint256 public plantationCount = 0;
    uint256 public constant CARBON_SEQUESTRATION_RATE = 25 * 10**17; // 2.5 tons/hectare/year
    
    mapping(uint256 => Plantation) public plantations;
    mapping(address => uint256[]) public userPlantations;
    mapping(address => bool) public verifiers;
    mapping(uint256 => PlantationUpdate[]) public plantationHistory;
    
    struct PlantationUpdate {
        uint256 timestamp;
        string dataHash;
        uint256 carbonSequestered;
        string note;
    }

    event PlantationRegistered(
        uint256 indexed plantationId,
        address indexed owner,
        string location,
        uint256 area
    );
    
    event PlantationUpdated(
        uint256 indexed plantationId,
        uint256 carbonSequestered,
        string dataHash
    );
    
    event PlantationVerified(
        uint256 indexed plantationId,
        address indexed verifier,
        bool verified,
        string note
    );
    
    event TokensIssued(
        uint256 indexed plantationId,
        address indexed owner,
        uint256 amount
    );
    
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Only verifier can call this");
        _;
    }

    modifier plantationExists(uint256 _plantationId) {
        require(_plantationId > 0 && _plantationId <= plantationCount, "Plantation does not exist");
        _;
    }

    constructor(address _carbonTokenAddress) {
        owner = msg.sender;
        admin = msg.sender;
        carbonToken = ICarbonCreditToken(_carbonTokenAddress);
        verifiers[msg.sender] = true;
    }

    // Register new plantation
    function registerPlantation(
        string memory _location,
        uint256 _area,
        uint256 _plantedDate,
        uint256 _treeCount,
        uint256 _mangrovePercentage,
        string memory _plantationDataHash
    ) external returns (uint256) {
        require(_area > 0, "Area must be greater than 0");
        require(_treeCount > 0, "Tree count must be greater than 0");
        require(bytes(_location).length > 0, "Location cannot be empty");

        plantationCount++;
        uint256 plantationId = plantationCount;

        uint256 carbonSequestered = (_area * CARBON_SEQUESTRATION_RATE) / 10**18;

        plantations[plantationId] = Plantation({
            id: plantationId,
            owner: msg.sender,
            location: _location,
            area: _area,
            plantedDate: _plantedDate,
            treeCount: _treeCount,
            mangrovePercentage: _mangrovePercentage,
            plantationDataHash: _plantationDataHash,
            carbonSequestered: carbonSequestered,
            verified: false,
            verificationDate: 0,
            verifier: address(0),
            verificationNote: "",
            tokensIssued: 0,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        userPlantations[msg.sender].push(plantationId);

        emit PlantationRegistered(plantationId, msg.sender, _location, _area);

        return plantationId;
    }

    // Update plantation data
    function updatePlantation(
        uint256 _plantationId,
        string memory _plantationDataHash,
        uint256 _carbonSequestered,
        string memory _note
    ) external plantationExists(_plantationId) {
        Plantation storage plantation = plantations[_plantationId];
        require(plantation.owner == msg.sender, "Only owner can update");

        plantation.plantationDataHash = _plantationDataHash;
        plantation.carbonSequestered = _carbonSequestered;
        plantation.updatedAt = block.timestamp;

        plantationHistory[_plantationId].push(PlantationUpdate({
            timestamp: block.timestamp,
            dataHash: _plantationDataHash,
            carbonSequestered: _carbonSequestered,
            note: _note
        }));

        emit PlantationUpdated(_plantationId, _carbonSequestered, _plantationDataHash);
    }

    // Verify plantation
    function verifyPlantation(
        uint256 _plantationId,
        bool _verified,
        string memory _note
    ) external onlyVerifier plantationExists(_plantationId) {
        Plantation storage plantation = plantations[_plantationId];

        plantation.verified = _verified;
        plantation.verificationDate = block.timestamp;
        plantation.verifier = msg.sender;
        plantation.verificationNote = _note;

        emit PlantationVerified(_plantationId, msg.sender, _verified, _note);
    }

    // Issue carbon credits
    function issueCarbonCredits(uint256 _plantationId) 
        external 
        onlyAdmin 
        plantationExists(_plantationId) 
    {
        Plantation storage plantation = plantations[_plantationId];
        require(plantation.verified, "Plantation must be verified before issuing credits");
        require(plantation.tokensIssued == 0, "Tokens already issued for this plantation");

        uint256 tokenAmount = plantation.carbonSequestered * 10**18;
        plantation.tokensIssued = tokenAmount;

        carbonToken.mint(plantation.owner, tokenAmount);

        emit TokensIssued(_plantationId, plantation.owner, tokenAmount);
    }

    // Get plantation details
    function getPlantation(uint256 _plantationId) 
        external 
        view 
        plantationExists(_plantationId) 
        returns (Plantation memory) 
    {
        return plantations[_plantationId];
    }

    // Get user plantations
    function getUserPlantations(address _user) external view returns (uint256[] memory) {
        return userPlantations[_user];
    }

    // Get plantation history
    function getPlantationHistory(uint256 _plantationId) 
        external 
        view 
        plantationExists(_plantationId) 
        returns (PlantationUpdate[] memory) 
    {
        return plantationHistory[_plantationId];
    }

    // Add verifier
    function addVerifier(address _verifier) external onlyAdmin {
        require(_verifier != address(0), "Invalid verifier address");
        verifiers[_verifier] = true;
        emit VerifierAdded(_verifier);
    }

    // Remove verifier
    function removeVerifier(address _verifier) external onlyAdmin {
        verifiers[_verifier] = false;
        emit VerifierRemoved(_verifier);
    }

    // Get total carbon sequestered
    function getTotalCarbonSequestered() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 1; i <= plantationCount; i++) {
            if (plantations[i].verified) {
                total += plantations[i].carbonSequestered;
            }
        }
        return total;
    }

    // Transfer ownership
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner address");
        owner = newOwner;
    }

    // Set admin
    function setAdmin(address newAdmin) external onlyOwner {
        require(newAdmin != address(0), "Invalid admin address");
        admin = newAdmin;
    }
}
