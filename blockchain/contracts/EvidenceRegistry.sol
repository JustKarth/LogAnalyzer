// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.34;

/**
 * @title EvidenceRegistry
 * @dev Contract for anchoring and verifying evidence hashes on the blockchain
 * @notice Provides tamper-evident integrity verification for security evidence
 */
contract EvidenceRegistry {
    // Structs
    struct EvidenceRecord {
        uint256 id;
        string evidenceId;
        bytes32 hash;
        address anchorer;
        uint256 timestamp;
        uint256 blockNumber;
        bytes32 txHash;
        bool exists;
    }

    // State variables
    uint256 private _recordCounter;
    mapping(uint256 => EvidenceRecord) private recordsById;
    mapping(string => uint256) private evidenceIdToRecordId;
    
    // Role-based access control
    address public admin;
    mapping(address => bool) public authorizedAnchors;
    
    // Events
    event EvidenceAnchored(
        uint256 indexed recordId,
        string indexed evidenceId,
        bytes32 indexed hash,
        address anchorer,
        uint256 timestamp,
        uint256 blockNumber,
        bytes32 txHash
    );
    
    event EvidenceVerified(
        uint256 indexed recordId,
        string indexed evidenceId,
        bytes32 indexed hash,
        bool isValid,
        address verifier
    );
    
    event AnchorAuthorized(address indexed anchor, bool authorized);
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);

    // Errors
    error EvidenceAlreadyExists(string evidenceId);
    error InvalidEvidenceId(string evidenceId);
    error RecordNotFound(uint256 recordId);
    error UnauthorizedAddress(address account);
    error InvalidHash(bytes32 hash);
    error ZeroAddress();

    // Modifiers
    modifier onlyAdmin() {
        if (msg.sender != admin) revert UnauthorizedAddress(msg.sender);
        _;
    }

    modifier onlyAuthorized() {
        if (!authorizedAnchors[msg.sender] && msg.sender != admin) {
            revert UnauthorizedAddress(msg.sender);
        }
        _;
    }

    /**
     * @dev Constructor to initialize the contract
     * @param _admin Address of the admin account
     */
    constructor(address _admin) {
        if (_admin == address(0)) revert ZeroAddress();
        admin = _admin;
        authorizedAnchors[_admin] = true;
        _recordCounter = 0;
    }

    /**
     * @dev Anchor evidence to blockchain
     * @param evidenceId Unique identifier for the evidence
     * @param hash SHA-256 hash of the evidence content
     * @return recordId ID of the created record
     * @return txHash Transaction hash
     * @return blockNumber Block number where the evidence was anchored
     */
    function anchorEvidence(string calldata evidenceId, bytes32 hash) 
        external 
        onlyAuthorized 
        returns (uint256 recordId, bytes32 txHash, uint256 blockNumber) 
    {
        if (bytes(evidenceId).length == 0) revert InvalidEvidenceId(evidenceId);
        if (hash == bytes32(0)) revert InvalidHash(hash);
        
        // Check if evidence already exists
        if (evidenceIdToRecordId[evidenceId] != 0) {
            revert EvidenceAlreadyExists(evidenceId);
        }

        // Create new record
        _recordCounter++;
        recordId = _recordCounter;
        blockNumber = block.number;
        txHash = keccak256(abi.encodePacked(msg.sender, evidenceId, hash, block.timestamp));

        recordsById[recordId] = EvidenceRecord({
            id: recordId,
            evidenceId: evidenceId,
            hash: hash,
            anchorer: msg.sender,
            timestamp: block.timestamp,
            blockNumber: blockNumber,
            txHash: txHash,
            exists: true
        });

        // Update mappings
        evidenceIdToRecordId[evidenceId] = recordId;

        // Emit event
        emit EvidenceAnchored(
            recordId,
            evidenceId,
            hash,
            msg.sender,
            block.timestamp,
            blockNumber,
            txHash
        );

        return (recordId, txHash, blockNumber);
    }

    /**
     * @dev Verify evidence integrity
     * @param evidenceId Unique identifier for the evidence
     * @return isValid Whether the evidence exists and matches
     * @return storedHash The stored hash for comparison
     */
    function verifyEvidence(string calldata evidenceId) 
        external 
        view 
        returns (bool isValid, bytes32 storedHash) 
    {
        uint256 recordId = evidenceIdToRecordId[evidenceId];
        
        if (recordId == 0) {
            return (false, bytes32(0));
        }

        EvidenceRecord storage record = recordsById[recordId];
        if (!record.exists) {
            return (false, bytes32(0));
        }

        return (true, record.hash);
    }

    /**
     * @dev Get record details by ID
     * @param recordId ID of the record to retrieve
     * @return Complete record details
     */
    function getRecord(uint256 recordId) 
        external 
        view 
        returns (EvidenceRecord memory) 
    {
        if (recordId == 0 || recordId > _recordCounter) {
            revert RecordNotFound(recordId);
        }

        EvidenceRecord storage record = recordsById[recordId];
        if (!record.exists) {
            revert RecordNotFound(recordId);
        }

        return record;
    }

    /**
     * @dev Get record by evidence ID
     * @param evidenceId Unique identifier for the evidence
     * @return recordId ID of the record
     * @return record Complete record details
     */
    function getEvidenceByEvidenceId(string calldata evidenceId) 
        external 
        view 
        returns (uint256 recordId, EvidenceRecord memory record) 
    {
        recordId = evidenceIdToRecordId[evidenceId];
        
        if (recordId == 0) {
            return (0, EvidenceRecord(0, "", bytes32(0), address(0), 0, 0, bytes32(0), false));
        }

        record = recordsById[recordId];
        return (recordId, record);
    }

    /**
     * @dev Get total number of records
     * @return Total count of anchored evidence records
     */
    function getTotalRecords() external view returns (uint256) {
        return _recordCounter;
    }

    /**
     * @dev Authorize an address to anchor evidence
     * @param anchor Address to authorize
     * @param authorized Whether to authorize or revoke
     */
    function setAnchorAuthorization(address anchor, bool authorized) 
        external 
        onlyAdmin 
    {
        if (anchor == address(0)) revert ZeroAddress();
        authorizedAnchors[anchor] = authorized;
        emit AnchorAuthorized(anchor, authorized);
    }

    /**
     * @dev Transfer admin role
     * @param newAdmin Address of the new admin
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        if (newAdmin == address(0)) revert ZeroAddress();
        address oldAdmin = admin;
        admin = newAdmin;
        authorizedAnchors[newAdmin] = true;
        emit AdminChanged(oldAdmin, newAdmin);
    }

    /**
     * @dev Check if an address is authorized to anchor
     * @param account Address to check
     * @return Whether the address is authorized
     */
    function isAuthorized(address account) external view returns (bool) {
        return authorizedAnchors[account];
    }
}
