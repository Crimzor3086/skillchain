const axios = require('axios');

/**
 * IPFS service for uploading metadata and files
 * Supports both Pinata and IPFS HTTP API
 */

/**
 * Upload JSON metadata to IPFS via Pinata
 */
const uploadMetadataToPinata = async (metadata) => {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataContent: metadata,
        pinataMetadata: {
          name: `skillchain-credential-${Date.now()}.json`
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
        }
      }
    );

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Pinata upload error:', error.response?.data || error.message);
    throw new Error(`Failed to upload to Pinata: ${error.message}`);
  }
};

/**
 * Upload file to IPFS via Pinata
 */
const uploadFileToPinata = async (fileBuffer, fileName) => {
  try {
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('file', fileBuffer, fileName);
    formData.append('pinataMetadata', JSON.stringify({
      name: fileName
    }));

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
        }
      }
    );

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Pinata file upload error:', error.response?.data || error.message);
    throw new Error(`Failed to upload file to Pinata: ${error.message}`);
  }
};

/**
 * Upload metadata to IPFS (tries Pinata first, falls back to local IPFS)
 */
const uploadMetadata = async (metadata) => {
  try {
    // Try Pinata first if API keys are available
    if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_API_KEY) {
      console.log('Uploading metadata to Pinata...');
      return await uploadMetadataToPinata(metadata);
    }

    // Fallback to local IPFS node or Infura
    if (process.env.IPFS_API_URL) {
      console.log('Uploading metadata to IPFS HTTP API...');
      return await uploadMetadataToIPFS(metadata);
    }

    // If no IPFS service is configured, create a mock URI for development
    console.warn('No IPFS service configured, using mock URI');
    const mockHash = 'Qm' + Math.random().toString(36).substring(2, 48);
    return `https://ipfs.io/ipfs/${mockHash}`;

  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
};

/**
 * Upload metadata to IPFS HTTP API
 */
const uploadMetadataToIPFS = async (metadata) => {
  try {
    const response = await axios.post(
      `${process.env.IPFS_API_URL}/api/v0/add`,
      JSON.stringify(metadata),
      {
        headers: {
          'Content-Type': 'application/json'
        },
        auth: process.env.IPFS_API_KEY ? {
          username: process.env.IPFS_API_KEY,
          password: process.env.IPFS_API_SECRET
        } : undefined
      }
    );

    const hash = response.data.Hash;
    return `https://ipfs.io/ipfs/${hash}`;
  } catch (error) {
    console.error('IPFS HTTP API upload error:', error.response?.data || error.message);
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
};

/**
 * Upload file to IPFS
 */
const uploadFile = async (fileBuffer, fileName) => {
  try {
    // Try Pinata first if API keys are available
    if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_API_KEY) {
      console.log('Uploading file to Pinata...');
      return await uploadFileToPinata(fileBuffer, fileName);
    }

    // Fallback to local IPFS node
    console.log('Uploading file to IPFS HTTP API...');
    return await uploadFileToIPFS(fileBuffer, fileName);

  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

/**
 * Upload file to IPFS HTTP API
 */
const uploadFileToIPFS = async (fileBuffer, fileName) => {
  try {
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', fileBuffer, fileName);

    const response = await axios.post(
      `${process.env.IPFS_API_URL}/api/v0/add`,
      formData,
      {
        headers: formData.getHeaders(),
        auth: process.env.IPFS_API_KEY ? {
          username: process.env.IPFS_API_KEY,
          password: process.env.IPFS_API_SECRET
        } : undefined
      }
    );

    const hash = response.data.Hash;
    return `https://ipfs.io/ipfs/${hash}`;
  } catch (error) {
    console.error('IPFS file upload error:', error.response?.data || error.message);
    throw new Error(`Failed to upload file to IPFS: ${error.message}`);
  }
};

/**
 * Retrieve content from IPFS
 */
const getFromIPFS = async (hash) => {
  try {
    const response = await axios.get(`https://ipfs.io/ipfs/${hash}`);
    return response.data;
  } catch (error) {
    console.error('IPFS retrieval error:', error);
    throw new Error(`Failed to retrieve from IPFS: ${error.message}`);
  }
};

/**
 * Pin content to ensure it stays available
 */
const pinContent = async (hash) => {
  try {
    if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_API_KEY) {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinByHash',
        {
          hashToPin: hash,
          pinataMetadata: {
            name: `skillchain-pin-${Date.now()}`
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': process.env.PINATA_API_KEY,
            'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
          }
        }
      );
      return response.data;
    }

    // Fallback to local IPFS pin
    const response = await axios.post(
      `${process.env.IPFS_API_URL}/api/v0/pin/add?arg=${hash}`
    );
    return response.data;
  } catch (error) {
    console.error('IPFS pin error:', error);
    throw new Error(`Failed to pin content: ${error.message}`);
  }
};

module.exports = {
  uploadMetadata,
  uploadFile,
  getFromIPFS,
  pinContent
};